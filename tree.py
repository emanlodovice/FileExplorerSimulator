class Tree(object):
    def __init__(self, name, parent=None, is_directory=True):
        self.parent = parent
        self.is_directory = is_directory
        self._name = name
        self._sub_trees = {}

    def add_child(self, name, is_directory=True):
        if not self.is_directory:
            print "Cannot add file inside a file!"
            return None
        if not name in self._sub_trees:
            sub_tree = Tree(name, parent=self, is_directory=is_directory)
            self._sub_trees[name] = sub_tree
            return sub_tree
        else:
            print "Name already exists."
            return None

    def remove_child(self, name):
        if name in self._sub_trees:
            sub_tree = self._sub_trees[name]
            del self._sub_trees[name]
            return sub_tree
        else:
            print "Name not found!"
            return None

    def get_child(self, name):
        if name in self._sub_trees:
            return self._sub_trees[name]
        else:
            print "Name not found!"
            return None

    def display(self, tabs=0):
        print " " * (3 * tabs) + '-' + self._name
        for sub_tree in self._sub_trees:
            self._sub_trees[sub_tree].display(tabs + 1)

    def delete(self):
        if self.parent is not None:
            self.parent.remove_child(self._name)

    def path(self):
        if self.parent:
            return '{0}{1}/'.format(self.parent.path(), self._name)
        else:
            return '{0}/'.format(self._name,)


a = Tree(name="root")
b = a.add_child(name="1")
c = a.add_child(name="2")
e = b.add_child(name="1.1")
d = a.add_child(name="3", is_directory=False)
a.display()
print a.path()
print e.path()
