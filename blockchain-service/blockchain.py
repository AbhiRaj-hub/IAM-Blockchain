import hashlib
import json
import time
from pathlib import Path


class Block:
    def __init__(self, index, timestamp, transactions, previous_hash, nonce=0):
        self.index = index
        self.timestamp = timestamp
        self.transactions = transactions
        self.previous_hash = previous_hash
        self.nonce = nonce
        self.hash = self.compute_hash()

    def compute_hash(self):
        block_content = {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
        }
        block_string = json.dumps(block_content, sort_keys=True)
        return hashlib.sha256(block_string.encode()).hexdigest()

    def to_dict(self):
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transactions": self.transactions,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce,
            "hash": self.hash,
        }

    @staticmethod
    def from_dict(d):
        block = Block(
            index=d["index"],
            timestamp=d["timestamp"],
            transactions=d["transactions"],
            previous_hash=d["previous_hash"],
            nonce=d.get("nonce", 0),
        )
        block.hash = d["hash"]
        return block


class Blockchain:
    DIFFICULTY = 2  # Set difficulty suitable for fast responsive demo mining

    def __init__(self, storage_path="chain_data.json"):
        self.storage_path = Path(storage_path)
        self.chain: list[Block] = []
        self.pending_transactions: list[dict] = []

        if self.storage_path.exists():
            try:
                self._load()
            except Exception as e:
                print(f"[Blockchain] Warning: Failed to load {storage_path} ({e}), initializing fresh chain.")
                self._create_genesis_block()
                self._save()
        else:
            self._create_genesis_block()
            self._save()

    def _create_genesis_block(self):
        genesis = Block(index=0, timestamp=time.time(), transactions=[], previous_hash="0")
        genesis.hash = genesis.compute_hash()
        self.chain.append(genesis)

    def _proof_of_work(self, block: Block) -> str:
        block.nonce = 0
        computed_hash = block.compute_hash()
        target = "0" * self.DIFFICULTY
        while not computed_hash.startswith(target):
            block.nonce += 1
            computed_hash = block.compute_hash()
        return computed_hash

    def add_transaction(self, transaction: dict):
        required = {"type", "payload", "timestamp"}
        if not required.issubset(transaction):
            raise ValueError(f"Transaction must contain fields: {required}")
        self.pending_transactions.append(transaction)

    def mine_pending_transactions(self) -> Block:
        if not self.pending_transactions:
            raise ValueError("No pending transactions to mine")

        last_block = self.chain[-1]
        new_block = Block(
            index=last_block.index + 1,
            timestamp=time.time(),
            transactions=self.pending_transactions,
            previous_hash=last_block.hash,
        )
        new_block.hash = self._proof_of_work(new_block)

        self.chain.append(new_block)
        self.pending_transactions = []
        self._save()
        return new_block

    def is_chain_valid(self) -> tuple[bool, str]:
        """Validates the cryptographic integrity of the entire chain."""
        target = "0" * self.DIFFICULTY

        # Check genesis block
        if len(self.chain) == 0:
            return False, "Blockchain is empty"

        genesis = self.chain[0]
        if genesis.previous_hash != "0":
            return False, "Genesis block previous hash is not '0'"

        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current.hash != current.compute_hash():
                return False, f"Block #{current.index} hash does not match content (tampering detected)"

            if current.previous_hash != previous.hash:
                return False, f"Block #{current.index} previous_hash does not match Block #{previous.index} hash"

            if not current.hash.startswith(target):
                return False, f"Block #{current.index} does not satisfy Proof of Work difficulty ({self.DIFFICULTY})"

        return True, f"Chain is cryptographically valid ({len(self.chain)} blocks)"

    def get_transactions_by_type(self, tx_type: str) -> list[dict]:
        results = []
        for block in self.chain:
            for tx in block.transactions:
                if tx.get("type") == tx_type:
                    results.append({**tx, "block_index": block.index, "block_hash": block.hash})
        return results

    def find_transaction(self, predicate) -> list[dict]:
        """predicate(tx) -> bool. Returns matching transactions with block context."""
        results = []
        for block in self.chain:
            for tx in block.transactions:
                if predicate(tx):
                    results.append({**tx, "block_index": block.index, "block_hash": block.hash})
        return results

    def get_all_transactions(self) -> list[dict]:
        """Returns all transactions across all blocks with block context, newest first."""
        results = []
        for block in reversed(self.chain):
            for tx in reversed(block.transactions):
                results.append({
                    **tx,
                    "block_index": block.index,
                    "block_hash": block.hash,
                    "block_timestamp": block.timestamp,
                })
        return results

    def _save(self):
        data = [b.to_dict() for b in self.chain]
        self.storage_path.write_text(json.dumps(data, indent=2))

    def _load(self):
        data = json.loads(self.storage_path.read_text())
        self.chain = [Block.from_dict(b) for b in data]

    def to_list(self):
        return [b.to_dict() for b in self.chain]
