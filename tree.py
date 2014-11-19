class Tree(object):
    def __init__(self, key, parent=None, is_directory=True):
        self.parent = parent
        self.is_directory = is_directory
        self.key = key
        self._sub_trees = {}

    def add_child(self, key, is_directory=True):
        if not self.is_directory:
            print "Cannot add file inside a file!"
            return None
        if not key in self._sub_trees:
            sub_tree = Tree(key, parent=self, is_directory=is_directory)
            self._sub_trees[key] = sub_tree
            return sub_tree
        else:
            print "Name already exists."
            return None

    def remove_child(self, key):
        if key in self._sub_trees:
            sub_tree = self._sub_trees[key]
            del self._sub_trees[key]
            return sub_tree
        else:
            print "Name not found!"
            return None

    def get_child(self, key):
        if key in self._sub_trees:
            return self._sub_trees[key]
        else:
            print "Name not found!"
            return None

    def display(self, tabs=0):
        print " " * (3 * tabs) + '-' + self.key
        for sub_tree in self._sub_trees:
            self._sub_trees[sub_tree].display(tabs + 1)

    def delete(self):
        if self.parent is not None:
            self.parent.remove_child(self.key)

    def path(self):
        if self.parent:
            return '{0}{1}/'.format(self.parent.path(), self.key)
        else:
            return '{0}/'.format(self.key,)

    def search(self, key):
        if self.key == key:
            return True
        else:
            for k in self._sub_trees:
                if self._sub_trees[k].search(key):
                    return True
            return False

    def search_subtree(self, key):
        for k in self._sub_trees:
            if self._sub_trees[k].search(key):
                return True
        return False
