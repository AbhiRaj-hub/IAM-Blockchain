"""
Flask REST API — the bridge between your app layer (frontend/mobile) and
the blockchain layer. This is what your Node/FastAPI backend from the
architecture diagram would call.

Run: python api.py
Then hit endpoints like:
  POST /identity/issue        {"subject_name": "...", "role": "...", "clearance_level": 3}
  POST /identity/revoke       {"did": "...", "reason": "..."}
  POST /access/grant          {"did": "...", "resource": "...", "required_clearance": 2, "granted_by": "..."}
  POST /access/check          {"did": "...", "resource": "..."}
  POST /asset/anchor          {"filename": "...", "owner_did": "...", "content_base64": "..."}
  GET  /chain
  GET  /chain/validate
"""

import base64

from flask import Flask, jsonify, request

from blockchain import Blockchain
import models

app = Flask(__name__)
chain = Blockchain(storage_path="chain_data.json")


def mine_now():
    """For the demo we mine immediately after each transaction so state is
    visible right away. In production you'd batch transactions and mine on
    a timer or once N transactions queue up."""
    return chain.mine_pending_transactions()


@app.route("/identity/issue", methods=["POST"])
def api_issue_identity():
    data = request.get_json(force=True)
    tx = models.issue_identity(
        subject_name=data["subject_name"],
        role=data["role"],
        clearance_level=data["clearance_level"],
        issuer=data.get("issuer", "BEL-Authority"),
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({"status": "issued", "transaction": tx, "block_index": block.index}), 201


@app.route("/identity/revoke", methods=["POST"])
def api_revoke_identity():
    data = request.get_json(force=True)
    tx = models.revoke_identity(did=data["did"], reason=data["reason"])
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({"status": "revoked", "transaction": tx, "block_index": block.index}), 201


@app.route("/access/grant", methods=["POST"])
def api_grant_access():
    data = request.get_json(force=True)
    tx = models.grant_access(
        did=data["did"],
        resource=data["resource"],
        required_clearance=data["required_clearance"],
        granted_by=data.get("granted_by", "BEL-Authority"),
    )
    chain.add_transaction(tx)
    block = mine_now()
    return jsonify({"status": "granted", "transaction": tx, "block_index": block.index}), 201


@app.route("/access/check", methods=["POST"])
def api_check_access():
    """Checks current identity + grant state and logs the attempt on-chain."""
    data = request.get_json(force=True)
    did, resource = data["did"], data["resource"]

    identity_events = chain.find_transaction(lambda tx: tx["type"] in ("IDENTITY_ISSUE", "IDENTITY_REVOKE") and tx["payload"].get("did") == did)
    revoked = any(e["type"] == "IDENTITY_REVOKE" for e in identity_events)

    grant_events = chain.find_transaction(lambda tx: tx["type"] in ("ACCESS_GRANT", "ACCESS_REVOKE") and tx["payload"].get("did") == did and tx["payload"].get("resource") == resource)
    has_active_grant = bool(grant_events) and grant_events[-1]["type"] == "ACCESS_GRANT"

    decision = "ALLOWED" if (has_active_grant and not revoked) else "DENIED"

    log_tx = models.log_access_attempt(did, resource, decision)
    chain.add_transaction(log_tx)
    mine_now()

    return jsonify({"did": did, "resource": resource, "decision": decision})


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
    return jsonify({"status": "anchored", "transaction": tx, "block_index": block.index}), 201


@app.route("/asset/verify", methods=["POST"])
def api_verify_asset():
    data = request.get_json(force=True)
    file_bytes = base64.b64decode(data["content_base64"])
    ok = models.verify_asset_integrity(file_bytes, data["expected_hash"])
    return jsonify({"integrity_intact": ok})


@app.route("/chain", methods=["GET"])
def api_get_chain():
    return jsonify(chain.to_list())


@app.route("/chain/validate", methods=["GET"])
def api_validate_chain():
    valid, message = chain.is_chain_valid()
    return jsonify({"valid": valid, "message": message})


if __name__ == "__main__":
    app.run(debug=True, port=5000)