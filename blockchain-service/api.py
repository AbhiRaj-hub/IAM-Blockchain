"""
Flask REST API — the bridge between the Node.js application layer and
the Python blockchain layer.

Run: python api.py
Default port: 5001
"""

import base64
import os
import sys
from flask import Flask, jsonify, request

from blockchain import Blockchain
import models

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

chain = Blockchain(storage_path="chain_data.json")


def mine_now():
    """Immediately mines pending transactions into a new block."""
    return chain.mine_pending_transactions()


@app.route("/health", methods=["GET"])
def api_health():
    return jsonify({
        "status": "healthy",
        "service": "Python Blockchain Service",
        "blocks_count": len(chain.chain),
        "difficulty": chain.DIFFICULTY
    }), 200


@app.route("/identity/issue", methods=["POST"])
def api_issue_identity():
    data = request.get_json(force=True)
    tx = models.issue_identity(
        subject_name=data["subject_name"],
        role=data["role"],
        clearance_level=int(data["clearance_level"]),
        issuer=data.get("issuer", "BEL-Authority"),
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({
        "status": "issued",
        "transaction": tx,
        "block_index": block.index,
        "block_hash": block.hash,
        "did": tx["payload"]["did"],
        "credential_id": tx["payload"]["credential_id"]
    }), 201


@app.route("/identity/revoke", methods=["POST"])
def api_revoke_identity():
    data = request.get_json(force=True)
    tx = models.revoke_identity(
        did=data["did"],
        reason=data.get("reason", "Revoked by Administrator"),
        issuer=data.get("issuer", "BEL-Authority")
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({
        "status": "revoked",
        "transaction": tx,
        "block_index": block.index,
        "block_hash": block.hash,
        "did": data["did"]
    }), 201


@app.route("/access/grant", methods=["POST"])
def api_grant_access():
    data = request.get_json(force=True)
    tx = models.grant_access(
        did=data["did"],
        resource=data["resource"],
        required_clearance=int(data["required_clearance"]),
        granted_by=data.get("granted_by", "BEL-Authority"),
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({
        "status": "granted",
        "transaction": tx,
        "block_index": block.index,
        "block_hash": block.hash,
        "grant_id": tx["payload"]["grant_id"]
    }), 201


@app.route("/access/revoke", methods=["POST"])
def api_revoke_access():
    data = request.get_json(force=True)
    tx = models.revoke_access(
        grant_id=data.get("grant_id", ""),
        did=data["did"],
        resource=data["resource"],
        revoked_by=data.get("revoked_by", "BEL-Authority")
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({
        "status": "revoked",
        "transaction": tx,
        "block_index": block.index,
        "block_hash": block.hash
    }), 201


@app.route("/access/check", methods=["POST"])
def api_check_access():
    data = request.get_json(force=True)
    did, resource = data["did"], data["resource"]
    user_clearance = int(data.get("clearance_level", 1))
    required_clearance = int(data.get("required_clearance", 1))

    identity_events = chain.find_transaction(
        lambda tx: tx["type"] in ("IDENTITY_ISSUE", "IDENTITY_REVOKE") and tx["payload"].get("did") == did
    )
    revoked = any(e["type"] == "IDENTITY_REVOKE" for e in identity_events)

    clearance_ok = user_clearance >= required_clearance

    grant_events = chain.find_transaction(
        lambda tx: tx["type"] in ("ACCESS_GRANT", "ACCESS_REVOKE") and tx["payload"].get("did") == did and tx["payload"].get("resource") == resource
    )
    has_active_grant = bool(grant_events) and grant_events[-1]["type"] == "ACCESS_GRANT"

    if revoked:
        decision = "DENIED"
        reason = "Identity is revoked on blockchain"
    elif clearance_ok or has_active_grant:
        decision = "ALLOWED"
        reason = f"Clearance level {user_clearance} satisfies requirement {required_clearance}"
    else:
        decision = "DENIED"
        reason = f"Clearance level {user_clearance} is below required level {required_clearance}"

    log_tx = models.log_access_attempt(did, resource, decision)
    log_tx["payload"]["reason"] = reason
    chain.add_transaction(log_tx)
    block = mine_now()

    return jsonify({
        "did": did,
        "resource": resource,
        "decision": decision,
        "reason": reason,
        "block_index": block.index,
        "block_hash": block.hash,
        "transaction": log_tx
    }), 200


@app.route("/asset/anchor", methods=["POST"])
def api_anchor_asset():
    data = request.get_json(force=True)
    file_bytes = base64.b64decode(data["content_base64"])
    tx = models.anchor_asset(
        file_bytes=file_bytes,
        owner_did=data["owner_did"],
        filename=data["filename"],
        version=data.get("version", 1),
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({
        "status": "anchored",
        "transaction": tx,
        "block_index": block.index,
        "block_hash": block.hash,
        "sha256": tx["payload"]["sha256"],
        "asset_id": tx["payload"]["asset_id"]
    }), 201


@app.route("/asset/verify", methods=["POST"])
def api_verify_asset():
    data = request.get_json(force=True)
    file_bytes = base64.b64decode(data["content_base64"])
    expected_hash = data["expected_hash"]
    computed_hash = models.hashlib.sha256(file_bytes).hexdigest()
    is_valid = (computed_hash == expected_hash)
    return jsonify({
        "integrity_intact": is_valid,
        "expected_hash": expected_hash,
        "computed_hash": computed_hash,
        "status": "VERIFIED" if is_valid else "TAMPERED"
    }), 200


@app.route("/chain", methods=["GET"])
def api_get_chain():
    return jsonify({
        "length": len(chain.chain),
        "chain": chain.to_list()
    }), 200


@app.route("/chain/validate", methods=["GET"])
def api_validate_chain():
    valid, message = chain.is_chain_valid()
    return jsonify({
        "valid": valid,
        "message": message,
        "blocks_count": len(chain.chain)
    }), 200


@app.route("/chain/audit", methods=["GET"])
def api_get_audit_history():
    all_txs = chain.get_all_transactions()
    return jsonify({
        "count": len(all_txs),
        "transactions": all_txs
    }), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"[*] Starting Blockchain Service on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
