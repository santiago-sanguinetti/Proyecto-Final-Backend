export default class UserDTO {
    constructor(user) {
        (this._id = user._id),
            (this.email = user.email),
            (this.role = user.role);
    }

    toJSON() {
        return {
            _id: this._id,
            email: this.email,
            role: this.role,
        };
    }
}
