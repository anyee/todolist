var ToDoList = (function(){
    var instance;

    function ToDoList() {
        this.newItem = document.getElementById("new-item");
        this.addBtn = document.getElementById("add-btn");
        this.todoList = document.getElementById("to-do-list").getElementsByTagName("ul")[0];
        this.doneList = document.getElementById("done-list").getElementsByTagName("ul")[0];

        if (window.localStorage && localStorage.todolist) {
            this.localList = JSON.parse(localStorage.todolist);
            this.init();
        } else {
            this.localList = {
                "todo": [],
                "done": []
            };
        }
        this.bindEvent();
    }

    ToDoList.prototype.init = function() {
        var _this = this;

        var todo = this.localList.todo;
        var done = this.localList.done;

        todo && todo.map(function(item) {_this.createItem("todo", item)});
        done && done.map(function(item) {_this.createItem("done", item)});

        this.newItem.focus();
    };

    ToDoList.prototype.addToLocalList = function(list, item) {
        if (list.getAttribute("data-type") === "todo") {
           this.localList.todo.push(item);
        } else {
            this.localList.done.push(item);
        }
        if (window.localStorage) { // 只有在浏览器支持的时候才运行这里的代码
            localStorage.todolist = JSON.stringify(this.localList);
        }
    };

    ToDoList.prototype.removeFromLocalList = function(list, item) {
        if (list.getAttribute("data-type") === "todo") {
            if (this.localList.todo.indexOf(item) !== -1) {
                this.localList.todo.splice(this.localList.todo.indexOf(item), 1);
            }
        } else {
            if (this.localList.done.indexOf(item) !== -1) {
                this.localList.done.splice(this.localList.done.indexOf(item), 1);
            }
        }
        if (window.localStorage) { // 只有在浏览器支持的时候才运行这里的代码
            localStorage.todolist = JSON.stringify(this.localList);
        }
    };

    ToDoList.prototype.addNewItem = function() {
        if(this.checkEmpty(this.newItem.value)) {
            this.tipso("内容不能为空");
        } else {
            var itemContent = this.newItem.value;
            this.createItem("todo", itemContent);
            this.newItem.value = "";
            this.localList.todo.push(itemContent);

            if (window.localStorage) { // 只有在浏览器支持的时候才运行这里的代码
                localStorage.todolist = JSON.stringify(this.localList);
            }
        }
    };

    ToDoList.prototype.delItem = function(delBtn) {
        var list = delBtn.parentNode;
        var itemContent = list.getAttribute("data-item");
        this.removeFromLocalList(list, itemContent);
        list.parentNode.removeChild(list);

    };

    ToDoList.prototype.editItem = function(_this, btn) {
        var list = btn.parentNode;
        var label = list.getElementsByTagName("label")[0];
        var editArea = list.querySelector("input[type='text']");
        var icon =btn.getElementsByTagName("i")[0];
        var fa = icon.getAttribute("class");
        var containsClassEdit = list.classList.contains("edit");

        if (containsClassEdit) {

            if(this.checkEmpty(editArea.value)) {
                this.tipso("内容不能为空!");
                return false;
            } else {
                label.innerText = editArea.value;

            list.setAttribute("data-item", editArea.value);
            _this.addToLocalList(list, editArea.value);

            fa = fa.replace(/save/, "edit");
            icon.setAttribute("class", fa);
            }

        } else {
            editArea.value = label.innerText;
            list.setAttribute("data-item", label.innerText);

            var itemContent = list.getAttribute("data-item");
            _this.removeFromLocalList(list, itemContent);

            fa = fa.replace(/edit/, "save");
            icon.setAttribute("class", fa);

        }
        list.classList.toggle("edit");
    };

    ToDoList.prototype.markAsDone = function(checkbox) {
        var _this = this;
        var list = checkbox.parentNode;
        var text = list.getAttribute("data-item");
        this.removeFromLocalList(list, text);
        list.setAttribute("data-type", "done");
        this.addToLocalList(list, text);

        list.parentNode.removeChild(list);
        this.doneList.appendChild(list);

        this.removeEvent(checkbox, "change", function() {
            _this.markAsDone(this);
        });
        this.addEvent(checkbox, "change", function() {
            _this.markAsTodo(this);
        });
    };

    ToDoList.prototype.markAsTodo = function(checkbox) {
        var _this = this;
        var list = checkbox.parentNode;
        var text = list.getAttribute("data-item");
        this.removeFromLocalList(list, text);
        list.setAttribute("data-type", "todo");
        this.addToLocalList(list, text);

        list.parentNode.removeChild(list);
        this.todoList.appendChild(list);

        this.removeEvent(checkbox, "change", function() {
            _this.markAsTodo(this);
        });
        this.addEvent(checkbox, "change", function() {
            _this.markAsDone(this);
        });
    };

    ToDoList.prototype.createItem = function(type, content) {
        var _this = this;
        var li = document.createElement("li");
        li.setAttribute("data-item", content);
        li.setAttribute("data-type", "todo");

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");

        this.addEvent(checkbox, "change", function() {
            _this.markAsDone(this);
        });

        var label = document.createElement("label");
        label.innerText = content;

        var text = document.createElement("input");
        text.setAttribute("type", "text");
        text.setAttribute("class", "edit-area");
        text.value = content;

        var editBtn = document.createElement("a");
        // editBtn.setAttribute("href", "#");
        editBtn.setAttribute("class", "edit-btn btn");

        this.addEvent(editBtn, "click", function() {
            _this.editItem(_this, editBtn);
        });

        var editIcon = document.createElement("i");
        editIcon.setAttribute("class", "fa fa-edit");
        editBtn.appendChild(editIcon);

        var delBtn = document.createElement("a");
        // delBtn.setAttribute("href", "#");
        delBtn.setAttribute("class", "del-btn btn");

        this.addEvent(delBtn, "click", function(e) {
            e.preventDefault();
            var delConfirm = confirm("Are you sure to delete it?");
            if (delConfirm) {
                _this.delItem(this);
            }
        });
        var delIcon = document.createElement("i");
        delIcon.setAttribute("class", "fa fa-trash-o");
        delBtn.appendChild(delIcon);

        this.addEvent(label, "dblclick", function(e) {
            _this.editItem(_this, editBtn);
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(text);
        li.appendChild(editBtn);
        li.appendChild(delBtn);

        if (type === "todo") {
            this.todoList.insertBefore(li, this.todoList.firstChild);
        } else {
            this.doneList.insertBefore(li, this.doneList.firstChild);
        }

    };

    ToDoList.prototype.bindEvent = function() {
        var _this = this;
        this.addEvent(this.addBtn, "click", function() {
            _this.addNewItem();
        });
        this.addEvent(this.newItem, "keydown", function(event) {
            if(event.keyCode == 13) {
                _this.addNewItem();
            }
        })
    };

    ToDoList.prototype.tipso = function(msg) {
        var _this = this;
        var message = document.getElementById("msg");
        message.textContent = msg;
        this.fadeIn(message);
        setTimeout(function() {
            _this.fadeOut(message);
        },1000);
    };

    ToDoList.prototype.trimStr = function(str) {
        if (!String.prototype.trim) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        } else {
            return str.trim();
        }
    };

    ToDoList.prototype.checkEmpty = function(str) {
        if(this.trimStr(str) === "") {
            return true;
        }
    };

    ToDoList.prototype.addEvent = function(node, type, handler) {
        if (!node) return false;
        if (node.addEventListener) {
            node.addEventListener(type, handler, false);
            return true;
        } else if (node.attachEvent) {
            node.attachEvent('on' + type, handler);
            return true;
        }
        return false;
    };

    ToDoList.prototype.removeEvent = function(node, type, handler) {
        if (!node) return false;
        if (node.removeEventListener) {
            node.removeEventListener(type, handler, false);
            return true;
        } else if (node.detachEvent) {
            node.detachEvent('on' + type, handler);
            return true;
        }
        return false;
    };

    ToDoList.prototype.fadeIn = function(el) {
        var opacity = 0;

        el.style.opacity = 0;
        el.style.filter = '';

        var last = +new Date();
        var tick = function() {
            opacity += (new Date() - last) / 400;
            el.style.opacity = opacity;
            el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

            last = +new Date();

            if (opacity < 1) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };

        tick();
    };

    ToDoList.prototype.fadeOut = function(el) {
        var opacity = 1;

        el.style.opacity = 1;
        el.style.filter = '';

        var last = +new Date();
        var tick = function() {
            opacity -= (new Date() - last) / 400;
            el.style.opacity = opacity;
            el.style.filter = 'alpha(opacity=' + (100 * opacity)|0 + ')';

            last = +new Date();

            if (opacity > 0) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };
        tick();
    };

    if (!instance) {
        instance = new ToDoList();
    }
    return instance;
})();

