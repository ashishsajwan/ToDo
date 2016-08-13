var colorlist = ['#E77E23', '#D5494A', '#26AD60', '#2A80B9', '#F39C11', '#2AAF63'];
/**
 * Backbone model to store single task
 */
var TaskModel = Backbone.Model.extend({
  initialize: function() {}
});
/*
 * Backbone collection to store task list
 */
var ToDoList = Backbone.Collection.extend({
  model: TaskModel,
  localStorage: new Backbone.LocalStorage('ToDoList'),
  initialize: function() {},
  //returns task based on their status Complete | inComplete
  filterTasks: function(status) {
    return this.where({
      status: status
    });
  }
});
var HeaderView = Backbone.View.extend({
  className: 'appHeader',
  initialize: function() {
    this.render();
  },
  render: function() {
    var headerTemplate = _.template($('#Tpl-header').html());
    this.$el.html(headerTemplate);
    $('#app-header-container').html(this.el);
  }
});
var BodyView = Backbone.View.extend({
  className: 'appBody',
  events: {
    'enter input': 'addTaskTodo',
    'click .glyphicon': 'removeTaskTodo'
  },
  // removes task from view | collection when clicked on remove icon
  removeTaskTodo: function(e) {
    var taskId = $(e.currentTarget).parents('.todoTask').attr('taskId');
    var task = this.collection.get({
      id: taskId
    });
    task.destroy();
    $('[taskId=' + taskId + ']').remove();
    this.countTasks();
  },
  // adds task to list when user enters something on text area & hit enter
  addTaskTodo: function(e) {
    var that = this;
    var pickColor = colorlist[this.collection.length % colorlist.length];
    var task = {
      'taskTitle': $(e.currentTarget).val(),
      'status': 'incomplete',
      'color': pickColor
    };
    task = this.collection.create(task);
    this.renderToDoTask(task.toJSON());
    $(e.currentTarget).val('');
    this.countTasks();
  },
  // renders a task in to be done tasks list
  renderToDoTask: function(task) {
    var toDoTaskTemplate = _.template($('#Tpl-toDoTask').html());
    $('#todo-task-container').append(toDoTaskTemplate(task));
  },
  //renders a task in completed task list
  renderCompletedTask: function(task) {
    var toDoTaskTemplate = _.template($('#Tpl-completedTask').html());
    $('#done-task-list').append(toDoTaskTemplate(task));
  },
  countTasks: function() {
    var completed = _.size(this.collection.filterTasks('complete'));
    var inCompleted = _.size(this.collection.filterTasks('incomplete'));
    $('#completed-task-count').html(completed + ' task in list');
    $('#pending-task-count').html(inCompleted + ' task in list');
  },
  initialize: function() {
    var that = this;
    this.collection.fetch();
    this.render();
    this.activateDragDrop();
  },
  // activates drag & drop for both the list
  activateDragDrop: function() {
    var that = this;
    dragula([document.getElementById('todo-task-container'), document.getElementById('done-task-list')]).on('drag', function(el) {
      if ($(el).hasClass('todoTask')) {
        el.className += ' markingComplete';
      }
      if ($(el).hasClass('taskComplete')) {
        el.className += ' markingInComplete col-xs-6';
      }
    }).on('drop', function(el, target, source) {
      if (target == source) {
        return false;
      }
      if ($(el).hasClass('todoTask')) {
        var taskId = $(el).attr('taskId');
        var task = that.collection.get({
          id: taskId
        });
        task.set({
          'status': 'complete'
        });
        task.save();
        that.renderCompletedTask(task.toJSON());
        $(el).remove();
      }
      if ($(el).hasClass('taskComplete')) {
        var taskId = $(el).attr('taskId');
        var task = that.collection.get({
          id: taskId
        });
        task.set({
          'status': 'incomplete'
        });
        task.save();
        that.renderToDoTask(task.toJSON());
        $(el).remove();
      }
      that.countTasks();
    });
  },
  render: function() {
    var that = this;
    var bodyTemplate = _.template($('#Tpl-body').html());
    this.$el.html(bodyTemplate);
    $('#app-body-container').html(this.el);
    var incompleteTaskslist = this.collection.filterTasks('incomplete');
    _.each(incompleteTaskslist, function(task) {
      that.renderToDoTask(task.toJSON());
    });
    var completeTaskslist = this.collection.filterTasks('complete');
    _.each(completeTaskslist, function(task) {
      that.renderCompletedTask(task.toJSON());
    });
    this.countTasks();
  }
});
$(document).ready(function() {
  // capturing enter key on inputs and firing enter event
  // so that pressing enter of input text area
  $(document).on('keyup', 'input', function(e) {
    if (e.keyCode == 13) {
      $(this).trigger('enter');
    }
  });
  var headerView = new HeaderView();
  var bodyView = new BodyView({
    collection: new ToDoList()
  });
});
