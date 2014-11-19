Tree = function(key, is_directory, parent) {
    this.parent = parent;
    this.is_directory = is_directory;
    this.key = key;
    this.sub_trees = {};
    this.content = '';
    var _this = this;

    this.add_child = function(key, is_directory) {
        if (!_this.is_directory){
            // console.log("Cannot add file inside a file!");
            return null;
        }
        if (_this.sub_trees.hasOwnProperty(key)) {
            // console.log("Name already exists.")
            return null;
        }
        // console.log(_this);
        var sub_tree = new Tree(key, is_directory, _this);
        _this.sub_trees[key] = sub_tree;
        return sub_tree;
    }

    this.add_subtree = function(t) {
        if (!_this.sub_trees.hasOwnProperty(t.key)) {
            _this.sub_trees[t.key] = t;
            t.parent = this;
            return true;
        }
        return false;
    }

    this.remove_child = function(key) {
        if (_this.sub_trees.hasOwnProperty(key)) {
            sub_tree = _this.sub_trees[key];
            delete _this.sub_trees[key];
            return sub_tree;
        }   else {
            // console.log("File not found!");
            return null;
        }
    }

    this.get_child = function(key) {
        if (_this.sub_trees.hasOwnProperty(key)) {
            return _this.sub_trees[key];
        }   else {
            // console.log("Name not found!")
            return null;
        }
    }

    this.display_tree = function(tabs) {
        tabs = tabs | 0;
        var res = ""
        for (var i=0; i < tabs; i++) {
            res += " ";
        }
        res += '-' + _this.key + '\n';
        for (var k in _this.sub_trees) {
            res += _this.sub_trees[k].display_tree(tabs + 3);
        }
        return res;
    }

    this.has_child = function(key) {
        return _this.sub_trees.hasOwnProperty(key);
    }

    this.delete = function() {
        if (_this.parent != null) {
            _this.parent.remove_child(_this.key)
        }
    }

    this.path = function() {
        if (_this.parent != null) {
            return _this.parent.path() + '/' + _this.key;
        }   else {
            return _this.key
        }
    }

    this.search = function(key) {
        if (_this.key == key) {
            return true;
        }   else {
            return _this.search_subtrees(key);
        }
    }

    this.search_subtrees = function(key) {
        for (var k in _this.sub_trees) {
            if (k == key) {
                return true;
            }
        }
        for (var k in _this.sub_trees) {
            if (_this.sub_trees[k].search_subtrees(key)) {
                return true;
            }
        }
        return false;
    }

    this.update_key = function(new_key) {
        if (this.parent != null && !this.parent.has_child(new_key)) {
            this.delete()
            this.key = new_key;
            this.parent.add_subtree(this);
            return true;
        }
        return false;
    }

    this.clone = function() {
        var clone = new Tree(this.key, this.is_directory, null);
        for (var key in this.sub_trees) {
            var child = this.sub_trees[key].clone();
            clone.add_subtree(child);
        }
        return clone;
    }
}

function test() {
    document.write("TEST START <br/>");
    document.write("create root: new Tree('root') <br/>");
    var root = new Tree('root', true);
    document.write("&nbsp&nbsp" + root.key + "<br/>");
    document.write("Check if root is a directory: root.is_directory <br/>");
    document.write("&nbsp&nbsp" + root.is_directory + "<br/>");
    document.write("Insert 'folder1' under root: root.add_child('folder1')<br/>");
    folder1 = root.add_child("folder1", true);
    document.write(root.display_tree().replace('\n', "<br/>").replace(' ', "&nbsp") + "<br/>");
    document.write("Add 'folder2' under root: root.add_child('folder2')<br/>");
    folder2 = root.add_child("folder2", true);
    document.write(root.display_tree().replace(new RegExp('\n', 'g'), "<br/>").replace(new RegExp(' ', 'g'), "&nbsp"));
    document.write("Add 'folder3' inside folder1: folder1.add_child('folder3') <br/>");
    folder1.add_child('folder3', true);
    document.write(root.display_tree().replace(new RegExp('\n', 'g'), "<br/>").replace(new RegExp(' ', 'g'), "&nbsp"));
    document.write("Remove 'folder2' from root: root.remove_child('folder2') <br/>");
    root.remove_child('folder2');
    document.write(root.display_tree().replace(new RegExp('\n', 'g'), "<br/>").replace(new RegExp(' ', 'g'), "&nbsp"));
    document.write("Search if 'folder2' exists: root.search('folder2') <br/>");
    document.write("&nbsp&nbsp" + root.search("folder2") + "<br/>");
    document.write("Search if 'folder1' exists: root.search('folder1') <br/>");
    document.write("&nbsp&nbsp" + root.search("folder1") + "<br/>");
    document.write("TEST END");
}


