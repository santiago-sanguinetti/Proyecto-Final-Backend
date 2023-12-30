export default class UserDTO {
    constructor(user) {
        (this._id = user._id),
            (this.first_name = user.first_name),
            (this.last_name = user.last_name),
            (this.email = user.email),
            (this.role = user.role),
            (this.age = user.age),
            (this.cart = user.cart);
    }

    toJSON() {
        return {
            _id: this._id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            role: this.role,
            cart: this.cart,
        };
    }
}
