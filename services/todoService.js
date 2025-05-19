class TodoService {
    constructor(db) {
        this.client = db.sequelize;
        this.Todo = db.Todo;
        // Add more models as needed, example:
        // this.Room = db.Room;
    }

    async create(name, deadline, points) {
        return this.Todo.create(
            {
                name: name,
                deadline: deadline,
                points: points
            }
        ).catch(function (err) {
            console.log(err);
        })
    }

    async getAll() {
        return this.Todo.findAll({
            where: {}
        }).catch(function (err) {
            console.log(err);
        })
    }
    
    async getOneById(todoId) {        
        return await this.Todo.findOne({
            where: {id: todoId}
        }).catch(function (err) {
            console.log(err);
        })
    }

    async deleteOneById(todoId) {
        return await this.Todo.destroy({
            where: {id: todoId}
        }).catch(function (err) {
            console.log(err);
        })
    }

}
module.exports = TodoService;