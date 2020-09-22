class Users {
    constructor(){
        this.users = [];
    }

    addUser(id,name){
        let user = {id, name};
        this.users.push(user);
    }

    getUserList() {
        let namesArray = this.users.map((user) => user.name);

        return namesArray;
    }

    getUser(id) {
    return this.users.filter((user) => user.id === id)[0];
    }

    removeUser(id) {
    let user = this.getUser(id);

    if(user){
        this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
    }
}

module.exports = { Users }
