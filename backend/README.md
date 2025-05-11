# E-Commerce backend

## Routes

### User

- Base Url - `/api/v1/auth`

| Route            | Method   | Description                                                                   |
| ---------------- | -------- | ----------------------------------------------------------------------------- |
| `/register`      | `POST`   | Register the user                                                             |
| `/login`         | `POST`   | Login the user                                                                |
| `/logout`        | `POST`   | Logout the user **(Loggedin user only)**                                      |
| `/refresh-token` | `POST`   | Refresh the access token **(Loggedin user only)**                             |
| `/me`            | `GET`    | Get Info of current user **(Loggedin user only)**                             |
| `/me`            | `PATCH`  | address , avatarUrl can update **(Loggedin user only)**                       |
| `/me/password`   | `PATCH`  | change password (old password must be true than new password can be accepted) |
| `/me`            | `DELETE` | Delete the current user **(Loggedin user only)**                              |
| `/orderHistory`  | `GET`    | Get the order hitory **(Loggedin user only)**                                 |


### Product

- Base Url - `/api/v1/products`

| Route         | Method | Description                                     |
| ------------- | ------ | ----------------------------------------------- |
| `/`           | `GET`  | List of all products by name , seller           |
| `/:productId` | `GET`  | Get the current Deatils of Product  (All users) |


### Cart

- Base Url - `/api/v1/carts`

| Route                  | Method   | Description                                               |
| ---------------------- | -------- | --------------------------------------------------------- |
| `/me/`                 | `GET`    | Get the carts deatils along with products (Loggedin user) |
| `/me/items`            | `POST`   | Add Product to the cart                                   |
| `/me/items/:productId` | `PATCH`  | Update quantity                                           |
| `/me/items/:productId` | `DELETE` | Delete the product                                        |
| `/me/clear`            | `DELETE` | Clear the cart                                            |

### Order

- Base Url - `/api/v1/orders`

| Route              | Method  | Description                                         |
| ------------------ | ------- | --------------------------------------------------- |
| `/`                | `POST`  | Place a new order                                   |
| `/`                | `GET`   | Order History                                       |
| `/:orderId`        | `GET`   | Get data of order Id must belongs to logged-in user |
| `/:orderId/cancel` | `PATCH` | Canacel the order                                   |
| `/:orderId/pay`    | `POST`  | Make the payment                                    |


### Analytics

- Base Url - `/api/v1/analytics`

| Route                      | Method | Description                                                   |
| -------------------------- | ------ | ------------------------------------------------------------- |
| `/admin`                   | `GET`  | Get the overview of entire app (overall) **(Admin only)**     |
| `/admin/users`             | `GET`  | Get the info of users of app                                  |
| `/admin/products/sales`    | `GET`  | Get total sales info                                          |
| `/merchant`                | `GET`  | Get the analytics of merchant (overall )  **(merchant only)** |
| `/merchant/products/sales` | `GET`  | Get the analytics of products total sells                     |



### Admin

- Base Url - `/api/v1/admin`

| Route                   | Method   | Description                                 |
| ----------------------- | -------- | ------------------------------------------- |
| `/users`                | `GET`    | Get the All user info                       |
| `/users/:userId`        | `GET`    | Get the info of user as per user Id         |
| `/users/:userId`        | `DELETE` | Delete the user                             |
| `/users/role/:userId`   | `PATCH`  | Update the role                             |
| `/merchant`             | `GET`    | Get the All merchant info                   |
| `/merchant/:merchantId` | `GET`    | Get the info of merchant as per merchant Id |
| `/merchant/:merchantId` | `DELETE` | Delete the merchant                         |
| `/products`             | `GET`    | Get the All products info                   |
| `/products/:productId`  | `GET`    | Get the info of products as per products Id |
| `/products/:productId`  | `PATCH`  | Update the product info                     |
| `/products/:productId`  | `DELETE` | Delete the products                         |
| `/orders`               | `GET`    | Get the All orders info                     |
| `/orders/:ordersId`     | `GET`    | Get the info of orders as per orders Id     |
| `/orders/:ordersId`     | `DELETE` | Delete the orders                           |



### Merchants

- Base Url - `/api/v1/merchant`

| Route                     | Method   | Description                                                     |
| ------------------------- | -------- | --------------------------------------------------------------- |
| `/me`                     | `GET`    | Get the info of current merchant                                |
| `/me`                     | `PATCH`  | Update merchant info                                            |
| `/products`               | `POST`   | Create a new Product                                            |
| `/products`               | `GET`    | Get the info of all products                                    |
| `/products/:productId`    | `GET`    | Get the info of product                                         |
| `/products/:productId`    | `PATCH`  | Update the product info                                         |
| `/products/:productId`    | `DELETE` | Delete Product                                                  |
| `/orders`                 | `GET`    | Get the info all order where seller is current merchants        |
| `/orders/:orderId`        | `GET`    | Get info of specific order Id where seller is current merchants |
| `/orders/status/:orderId` | `PATCH`  | Update the order status                                         |