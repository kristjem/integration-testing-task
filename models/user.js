module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('User', {
        // model attributes should be camelCased
        username: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        score: {
            type: Sequelize.DataTypes.INTEGER,
            defaultValue: 3,
            allowNull: false
        }
    }, {
        timestamps: false
    });
    // Example, if associating with other models:
    // User.associate = function(models) {
    //     User.belongsToMany(models.Hotel, {through: models.Rate})
    //     User.belongsToMany(models.Room, {through: models.Reservation})
    // };
	return User
}