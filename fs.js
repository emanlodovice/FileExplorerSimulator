FileSystem = function() {
    this.root = new Tree('root', true);
    this.current_dir = this.root;
    this.tree_to_change = null;
    _this = this;

    this.cd = function(params, callback) {
        if (params == '/') {
            result = {'code':200, 'msg': 'Success', 'current_tree':this.root, 'text': null};
            callback(result);
        }   else {
            parsePath(params, false, true, function(result) {
                if (!result['current_tree'].is_directory) {
                    result['code'] = 404;
                    result['msg'] = 'Not a directory!'
                    result['current_tree'] = null;
                }
                result['text'] = null;
                callback(result);
            });
        } 
    }

    this.tree = function(params, callback){
        if (params == '') {
            var res = {'code':200, 'msg': 'Success', 'current_tree':null};
            res['text'] = this.current_dir.display_tree();
            callback(res);
        }   else {
            parsePath(params, false, true, function(res) {
                if (res.code == 200) {
                    res['text'] = res.current_tree.display_tree();
                    callback(res);
                }   else {
                    callback(res);
                }
            });
        }
    }

    this.ls = function(params, callback) {
        if (params == '' || params == '-') {
            var res = {'code':200, 'msg': 'Success', 'current_tree':null};
            res['text'] = '';
            for (var key in this.current_dir.sub_trees) {
                if (res['text'] != '') {
                    res['text'] += '\n';
                }
                res['text'] += key;
            }
            callback(res);
        }   else {
            parsePathRegex(params, function(res) {
                if (res.code == 200) {
                    res['text'] = '';
                    if (res['trees'].length > 0) {
                        for (var i=0; i < res.trees.length; i++) {
                            if (res['text'] != '') {
                                res['text'] += '\n';
                            }
                            res['text'] += res['trees'][i].key;
                        }
                    }   else {
                        res['text'] = 'No such file or directory!';
                    }
                    callback(res);
                }   else {
                    callback(res);
                }
            });
        }
    }

    this.mkdir = function(params, callback) {
        parsePath(params, true, true, function(res) {
            res['current_tree'] = null;
            callback(res);
        });
    }

    this.rmdir = function(params, callback) {
        parsePath(params, false, true, function(res) {
            if (res.code == 200) {
                if (res.current_tree.is_directory) {
                    res['current_tree'].delete();
                    res['current_tree'] = null;
                }   else {
                    res['current_tree'] = null;
                    res['tree'] = 'Not a directory!';
                }
                callback(res);
            }   else {
                callback(res);
            }
        });
    }

    // this.cat = function(params, callback) {
    //     var index = params.lastIndexOf('&gt;');
    //     if (index > 0) {
    //         try {
    //             var content = params.substring(0, index).trim().replace(new RegExp('"', 'g'), '');
    //             var path = params.substring(index + 4).trim();
    //             parsePath(path, true, false, function(res) {
    //                 res['current_tree'].content += content;
    //                 res['current_tree'] = null;
    //                 callback(res);
    //             });
    //         } catch(e) {
    //             callback({'code':404, 'msg': 'Invalid parameters!', 'current_tree':null});    
    //         }
    //     }   else {
    //         callback({'code':404, 'msg': 'Invalid parameters!', 'current_tree':null});
    //     }
    // }

    this.edit = function(params, callback) {
        parsePath(params, true, false, function(res) {
            if (res['code'] == 200) {
                if (!res['current_tree'].is_directory) {
                    this.tree_to_change = res['current_tree'];
                    res['current_tree'] = null;
                    res['input_state'] = true;
                    res['tree_to_change'] = this.tree_to_change;
                    res['text'] = this.tree_to_change.content;
                }   else {
                    res['current_tree'] = null;
                    res['code'] = 404;
                    res['msg'] = 'Cannot edit a directory!';
                }
            }
            callback(res);
        });
    }

    this.save = function(text, callback) {
        if (this.tree_to_change != null) {
            this.tree_to_change.content += text;
            this.tree_to_change = null;
            callback({'code': 200, 'text': 'Saved', 'current_tree': null, 'input_state': false});
        }   else {
            callback({'code': 404, 'msg': 'Command not available!'})
        }
    }

    this.rm = function(params, callback) {
        parsePathRegex(params, function(res) {
            if (res.code == 200) {
                res['text'] = '';
                if (res['trees'].length > 0) {
                    for (var i=0; i < res.trees.length; i++) {
                        res.trees[i].delete();
                    }
                }   else {
                    res['code'] = 404;
                    res['msg'] = 'No such file or directory!';
                }
                callback(res);
            }   else {
                callback(res);
            }  
        })
    }


    this.show = function(params, callback) {
        parsePath(params, false, false, function(res) {
            if (res['code'] == 200) {
                if (res['current_tree'].is_directory == false) {
                    res['text'] = res['current_tree'].content
                }   else {
                    res['code'] = 404;
                    res['msg'] = 'Not a file!';
                }
                res['current_tree'] = null;
                callback(res);
            }   else {
                callback(res);
            }
            
        });
    }

    this.rn = function(params, callback) {
        var index = params.indexOf(' ');
        if (index > 0) {
            var path = params.substring(0, index);
            var new_name = params.substring(index).trim();
            parsePath(path, false, false, function(res) {
                if (res['code'] == 200) {
                    var success = res['current_tree'].update_key(new_name);
                    if (!success) {
                        res['code'] = 404;
                        res['msg'] = 'Name already exists!';
                    }
                    res['current_tree'] = null;
                }
                callback(res);
            });
        }   else {
            callback({'code': 404, 'msg': 'rn requires 2 parameters.'});
        }
    }

    this.mv = function(params, callback) {
        var index = params.indexOf(' ');
        if (index > 0) {
            var path = params.substring(0, index);
            var new_path = params.substring(index).trim();
            parsePath(path, false, false, function(res) {
                if (res['code'] == 200) {
                    parsePath(new_path, false, false, function(res2) {
                        if (res2['code'] == 200 && res2['current_tree'].path() != res['current_tree'].path()) {
                            if (res2['current_tree'].is_directory) {
                                old_d = res['current_tree'];
                                old_d.delete();
                                res2['current_tree'].add_subtree(old_d);
                                res2['current_tree'] = null;
                                callback(res2);
                            }   else {
                                res2['code'] = 404;
                                res2['msg'] = 'Cannot move to a file!';
                                res2['current_tree'] = null;
                                callback(res2);
                            }
                        }   else if (res2['code'] != 200) {
                            parsePath(new_path, true, res['current_tree'].is_directory, function(res3) {
                                if (res3['code'] == 200) {
                                    new_d = res3['current_tree'];
                                    res3['current_tree'] = null;
                                    parent = new_d.parent
                                    new_d.delete();
                                    old_d = res['current_tree']
                                    old_d.delete();
                                    old_d.key = new_d.key;
                                    parent.add_subtree(old_d);
                                    callback(res3);
                                }   else {
                                    callback(res3);
                                }
                            });
                        }   else {
                            res2['current_tree'] = null;
                            res2['msg'] = '';
                            callback(res2);
                        }
                    })
                }   else {
                    callback(res);
                }
            })
        }   else {
            callback({'code': 404, 'msg': 'mv requires 2 parameters.'});   
        }
    }

    this.cp = function(params, callback) {
        var index = params.indexOf(' ');
        if (index > 0) {
            var path = params.substring(0, index);
            var new_path = params.substring(index).trim();
            parsePath(path, false, false, function(res) {
                if (res['code'] == 200) {
                    parsePath(new_path, false, false, function(res2) {
                        if (res2['code'] == 200) {
                            if (res2['current_tree'].is_directory) {
                                old_d = res['current_tree'].clone();
                                res2['current_tree'].add_subtree(old_d);
                                res2['current_tree'] = null;
                                callback(res2);
                            }   else {
                                res2['code'] = 404;
                                res2['msg'] = 'Cannot move to a file!';
                                res2['current_tree'] = null;
                                callback(res2);
                            }
                        }   else {
                            parsePath(new_path, true, res['current_tree'].is_directory, function(res3) {
                                if (res3['code'] == 200) {
                                    new_d = res3['current_tree'];
                                    res3['current_tree'] = null;
                                    parent = new_d.parent
                                    new_d.delete();
                                    old_d = res['current_tree']
                                    old_d = old_d.clone();
                                    old_d.key = new_d.key;
                                    parent.add_subtree(old_d);
                                    callback(res3);
                                }   else {
                                    callback(res3);
                                }
                            });
                        }
                    })
                }   else {
                    callback(res);
                }
            })
        }   else {
            callback({'code': 404, 'msg': 'cp requires 2 parameters.'});   
        }
    }

    this.whereis = function(params, callback) {
        var regex = RegExp(convertToRegEx(params));
        var trees = this.current_dir.find(regex);
        var res = {'code':200, 'current_tree': null, 'text':''};
        if (trees.length <= 0) {
            res['text'] = 'No results found!';
        }
        for (var i = 0; i < trees.length; i++) {
            if (res['text'] != '') {
                res['text'] += '\n';
            }
            res['text'] += trees[i].path();
        }
        callback(res);
    }

    this.help = function(params, callback) {
        res = {'code': 200, 'current_tree': null};
        res['text'] = 'Allowed Commands: \n';
        res['text'] += '  "cd" to change directory \n';
        res['text'] += '  "tree" to show directory tree \n';
        res['text'] += '  "mkdir" to create directory \n';
        res['text'] += '  "rmdir" to delete directory \n';
        res['text'] += '  "edit" to create and edit files \n';
        res['text'] += '  "rm" to delete files \n';
        res['text'] += '  "rn" to rename file/directory \n';
        res['text'] += '  "mv" to move file/directory \n';
        res['text'] += '  "cp" to copy file/directory \n';
        res['ls'] += '  "ls" to list files/directories within the directory \n';
        res['show'] += '  "show" to display content of file \n';
        res['whereis'] += '  "whereis" to search for files or directories';
        callback(res);
    }


    function parsePath(path, force_create, is_directory, callback) {
        if (path == "") {
            callback({'code':404, 'msg': 'Empty path', 'current_tree':null});
            return;
        }
        var keys = path.split('/');
        var trav_root = _this.current_dir;
        var i = 0;
        if (keys[0] == '')  {
            trav_root = _this.root;
            i = 1;
        }
        for (; i < keys.length; i++) {
            if (keys[i] == '..') {
                if (trav_root.parent) {
                    trav_root = trav_root.parent;
                }   else {
                    callback({'code': 404, 'msg': 'No such file/directory!', 'current_tree':null});
                    return;
                }
            }   else {
                if (!trav_root.is_directory) {
                    callback({'code': 404, 'msg': 'Not a directory!', 'current_tree':null});
                    return;
                }
                if (keys[i] == '' &&  i + 1 == keys.length) {
                    continue;
                } 
                var temp = trav_root.get_child(keys[i]);
                if (temp == null) {
                    if (i == keys.length - 1 && force_create) {
                        trav_root = trav_root.add_child(keys[i], is_directory);
                    }   else {
                        callback({'code': 404, 'msg': 'No such file/directory!', 'current_tree':null});
                        return;
                    }
                }   else {
                    trav_root = temp;
                }
            }
        }
        callback({'code': 200, 'msg': 'Success', 'current_tree':trav_root});
    }

    function parsePathRegex(path, callback) {
        if (path == "") {
            callback({'code':404, 'msg': 'Empty path', 'trees':null});
            return;
        }
        var keys = path.split('/');
        if (keys[keys.length - 1] != '') {
            keys[keys.length - 1] = convertToRegEx(keys[keys.length - 1]);
        }
        var trav_root = _this.current_dir;
        var i = 0;
        if (keys[0] == '')  {
            trav_root = _this.root;
            i = 1;
        }
        for (; i < keys.length; i++) {
            if (i + 1 == keys.length) {
                if (!trav_root.is_directory) {
                    callback({'code': 404, 'msg': 'Not a directory!', 'trees':null});
                    return;
                }
                regex = RegExp(keys[i]);
                results = [];
                for (var key in trav_root.sub_trees) {
                    if (regex.test(key) == true) {
                        results.push(trav_root.sub_trees[key]);
                    }
                }
                callback({'code': 200, 'msg': 'Success', 'trees':results});
                return;
            }   else {
                if (keys[i] == '..') {
                    if (trav_root.parent) {
                        trav_root = trav_root.parent;
                    }   else {
                        callback({'code': 404, 'msg': 'No such file/directory!', 'trees':null});
                        return;
                    }
                }   else {
                    if (!trav_root.is_directory) {
                        callback({'code': 404, 'msg': 'Not a directory!', 'trees':null});
                        return;
                    }
                    if (keys[i] == '' &&  i + 1 == keys.length) {
                        continue;
                    } 
                    var temp = trav_root.get_child(keys[i]);
                    if (temp == null) {
                        callback({'code': 404, 'msg': 'No such file/directory!', 'trees':null});
                        return;
                    }   else {
                        trav_root = temp;
                    }
                }
            }
        }
    }

    function convertToRegEx(s) {
        s = s.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&");
        s = s.replace(/\*/g, ".*");
        s += '$';
        return s;
    }
}

fs = new FileSystem('root');