'use strict';

var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

//---------VVVV---------  your code below  ---------VVV----------

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
},
  {
  getterMethods: {
      timeRemaining() {
       return this.due ?
        this.due - new Date().getTime()
        : Infinity
      },
      overdue() {
        return this.timeRemaining < 0 && !this.complete
      }
    }
});

//class methods
Task.clearCompleted = function(){
  return Task.destroy({
    where: {
      complete: true
    }
  })
}

Task.completeAll = function() {
  return Task.update({ complete: true }, {
    where: {
      complete: false
    }
  })
}

//instance methods

Task.prototype.addChild = function(task) {
  let current = this
  return Task.create(task)
    .then(function(results) {
      return results.setParent(current)
    })
}

Task.prototype.getChildren = function() {
  return Task.findAll({
    where: {
      parentId : this.id
    }
  })
}

Task.prototype.getSiblings = function() {
  return Task.findAll({
    where: {
      parentId: this.parentId,
      id: {
        $ne: this.id
      }
    }
  })
}
//hook
Task.beforeDestroy(function(task, options){
  Task.destroy({
    where: {
      parentId: task.id
    }
  })
})

Task.belongsTo(Task, {as: 'parent'});


//---------^^^---------  your code above  ---------^^^----------

module.exports = Task;

