import hashlib
import time
import uuid

def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}"


def issue_identity(subject_name: str, role: str, clearance_level: int, issuer: str = "BEL-Authority") -> dict:
    did = f"did:bel:{uuid.uuid4().hex}"
    return {
        "type" : "IDENTITY_ISSUE",
        "timestamp" : time.time(),
        "payload" : {
            "credential_id" : _new_id("cred"),
            "did" : did,
            "subject_name" : subject_name,
            "role" : role,
            "clearance_level" : clearance_level,
            "issuer" : issuer,
            "status" : "ACTIVE"
        }
    }


def revoke_identity(did: str, reason: str, issuer: str = "BEL-Authority") -> dict:
    return { 
        "type" : "IDENTITY_REVOKE",
        "timestamp" : time.time(),
        "payload" : {
            "grant_id" : _new_id("grant"),
            "did" : did,
            "reason" : reason,
            "issuer" : issuer
        }
    }


def grant_access(grant_id: str, did: str, resource: str, required_clearance: int, granted_by: str) -> dict:
    return { 
        "type" : "ACCESS_GRANT",
        "timestamp" : time.time(),
        "payload" : {
            "grant_id" : grant_id,
            "did" : did,
            "resource" : resource,
            "required_clearance" : required_clearance,
            "granted_by" : granted_by
        }
    }


def revoked_acess(grant_id: str, did: str, resource: str, revoked_by: str) -> dict:
    return {
        "type" : "ACCESS_REVOKE",
        "timestamp" : time.time(),
        "payload" : {
            "grant_id" : grant_id,
            "did" : did,
            "resources" : resource,
            "revoked_by": revoked_by
        }
    }


def log_access_attempt(did: str, resource: str, decision: str) -> dict:
    return { 
        "type" : "ACCESS_ATTEMPT",
        "timestamp" : time.time(),
        "payload" : {
            "did" : did,
            "resource" : resource,
            "decision" : decision
        }
    }


def anchor_asset(file_bytes: bytes, owner_did: str, filename: str, version: int = 1) -> dict:
    file_hash = hashlib.sha256(file_bytes).hexdigest()
    return {
        "type" : "ASSET_ANCHOR",
        "timestamp": time.time(),
        "payload": {
            "asset_id": _new_id("asset"),
            "filename": filename,
            "version": version,
            "sha256": file_hash,
            "owner_did": owner_did
        }
    }

def verify_asset_integrity(file_bytes: bytes, expected_hash: str) -> bool:
    return hashlib.sha256(file_bytes).hexdigest() == expected_hash
