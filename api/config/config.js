module.exports = {
    development: {
        username: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        db: process.env.DBNAME,
        host: process.env.HOST,
        dialect: process.env.DBUSERNAME,
        port: "5432",
        dialectOptions: {
            options: {
                encrypt: false
            }
        }
    },
    // test: {
    //     username: "root",
    //     password: null,
    //     database: "database_test",
    //     host: "127.0.0.1",
    //     dialect: "mysql"
    // },
    production: {
        username: "root",
        password: null,
        database: "database_production",
        host: "127.0.0.1",
        dialect: "mysql"
    }
}

