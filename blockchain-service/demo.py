"""
End-to-end demo of the blockchain layer — run this directly to see the
whole identity -> access -> asset flow, plus proof that tampering is
detected. This is what you'd run live during the SIH demo.
"""

from blockchain import Blockchain
import models


def section(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def main():
    chain = Blockchain(storage_path="demo_chain.json")

    # ---------- 1. Identity issuance ----------
    section("1. Issuing identity for an employee")
    issue_tx = models.issue_identity(subject_name="R. Sharma", role="engineer", clearance_level=3)
    chain.add_transaction(issue_tx)
    block = chain.mine_pending_transactions()
    did = issue_tx["payload"]["did"]
    print(f"Issued DID: {did}")
    print(f"Sealed in block #{block.index}, hash={block.hash[:16]}...")

    # ---------- 2. Access grant ----------
    section("2. Granting access to a restricted resource")
    grant_tx = models.grant_access(did=did, resource="lab-3-restricted-docs", required_clearance=3, granted_by="System-Authority")
    chain.add_transaction(grant_tx)
    mined_block = chain.mine_pending_transactions()
    print(f"Mined in block #{mined_block.index}")

    # 4. Check access
    section("4. Evaluating access for the employee")
    # Clearance check on a level-2 resource (allowed)
    allowed_tx = models.log_access_attempt(did=did, resource="campus-bulletin", decision="ALLOWED")
    chain.add_transaction(allowed_tx)
    # Clearance check on a level-5 resource (denied)
    denied_tx = models.log_access_attempt(did=did, resource="classified-project-x", decision="DENIED")
    chain.add_transaction(denied_tx)
    mined_block = chain.mine_pending_transactions()
    print(f"Access attempts mined in block #{mined_block.index}")

    # 5. Anchor a digital asset
    section("5. Anchoring a sensitive PDF/asset")
    fake_pdf = b"%PDF-1.4 ... fake binary payload for sensitive schematic ..."
    asset_tx = models.anchor_asset(
        file_bytes=fake_pdf,
        owner_did=did,
        filename="radar_defense_schematic_v1.pdf",
        version=1
    )
    chain.add_transaction(asset_tx)
    mined_block = chain.mine_pending_transactions()
    print(f"Asset anchored in block #{mined_block.index}")
    print(f"SHA-256 Digest: {asset_tx['payload']['sha256']}")

    # 6. Revoking identity
    section("6. Revoking the employee's identity (e.g., policy update)")

    # ---------- 5. Verify asset integrity later ----------
    section("5. Later: verifying the asset hasn't been tampered with")
    still_intact = models.verify_asset_integrity(fake_document, asset_tx["payload"]["sha256"])
    print(f"Integrity check on unmodified file: {still_intact}")

    tampered_document = fake_document + b" -- secretly edited"
    still_intact_after_tamper = models.verify_asset_integrity(tampered_document, asset_tx["payload"]["sha256"])
    print(f"Integrity check on tampered file:   {still_intact_after_tamper}")

    # ---------- 6. Revoke identity, show access is now denied ----------
    section("6. Revoking the employee's identity (e.g., policy update)")
    revoke_tx = models.revoke_identity(did=did, reason="Employee offboarded")
    chain.add_transaction(revoke_tx)
    chain.mine_pending_transactions()

    identity_events = chain.find_transaction(lambda tx: tx["type"] in ("IDENTITY_ISSUE", "IDENTITY_REVOKE") and tx["payload"].get("did") == did)
    revoked = any(e["type"] == "IDENTITY_REVOKE" for e in identity_events)
    print(f"Identity revoked: {revoked} -> any future access check for this DID will now return DENIED")

    # ---------- 7. Full chain validation ----------
    section("7. Validating the full chain integrity")
    valid, message = chain.is_chain_valid()
    print(f"Chain valid: {valid} ({message})")
    print(f"Total blocks: {len(chain.chain)}")

    # ---------- 8. Prove tamper-detection works ----------
    section("8. Simulating an attacker editing a past block directly")
    chain.chain[1].transactions[0]["payload"]["clearance_level"] = 10  # sneaky edit, no re-mining
    valid, message = chain.is_chain_valid()
    print(f"Chain valid after tampering: {valid}")
    print(f"Reason: {message}")

    # ---------- 9. Audit trail query ----------
    section("9. Full audit trail for this employee's access history")
    audit = chain.find_transaction(lambda tx: tx.get("payload", {}).get("did") == did)
    for entry in audit:
        print(f"  block #{entry['block_index']} | {entry['type']:16s} | {entry['payload']}")


if __name__ == "__main__":
    main()
