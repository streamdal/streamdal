class KV:
    kvs = {}

    def __init__(self):
        pass

    def set(self, key, value) -> bool:
        """Set a key to a value and return True if the key already existed, False otherwise"""
        if key in self.kvs:
            self.kvs[key] = value
            return True

        self.kvs[key] = value
        return False

    def get(self, key) -> (str, bool):
        """Get a key and return the value and a boolean indicating whether the key existed"""
        if key not in self.kvs:
            return "", False

        return self.kvs[key], True

    def delete(self, key) -> bool:
        """Delete a key and return True if the key existed, False otherwise"""
        if key not in self.kvs:
            return False

        del self.kvs[key]
        return True

    def exists(self, key):
        """Return True if the key exists, False otherwise"""
        return key in self.kvs

    def keys(self):
        """Return a list of all keys"""
        return self.kvs.keys()

    def items(self):
        """Return a list of all items"""
        return self.kvs.values()

    def purge(self) -> int:
        """Purge all keys from the KV store and return the number of keys purged"""
        num_keys = len(self.kvs)
        self.kvs = {}
        return num_keys
