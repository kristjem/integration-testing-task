class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
    }

    async getAll() {
        return this.User.findAll({
            where: {}
        }).catch(function (err) {
            console.log(err);
            throw err; // <--- re-throw so the route can handle it
        })
    }
    
    async getOneByUsername(username) {
        return await this.User.findOne({
            where: {username: username}
        }).catch(function (err) {
            console.log(err);
            throw err; // <--- re-throw so the route can handle it
        })
    }
    
    async create(username, password, score) {
        return this.User.create(
            {
                username: username,
                password: password,
                score: score
            }
        ).catch(function (err) {
            console.log(err);
            throw err; // <--- re-throw so the route can handle it
        })
    }

    async deleteOneByUsername(username) {
        return await this.User.destroy({
            where: {username: username}
        }).catch(function (err) {
            console.log(err);
            throw err; // <--- re-throw so the route can handle it
        })
    }

}
module.exports = UserService;