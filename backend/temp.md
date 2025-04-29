# E-Commerce backend


## Routes


### user

- Base Url - `/api/v1/users`

| Route             | Method   | Description                                                                   |
| ----------------- | -------- | ----------------------------------------------------------------------------- |
| `/register`       | `POST`   | Register the user                                                             |
| `/login`          | `POST`   | Login the user                                                                |
| `/logout`         | `POST`   | Logout the user **(Loggedin user only)**                                      |
| `/refreshToken`   | `POST`   | Refresh the access token **(Loggedin user only)**                             |
| `/updateDeatils`  | `PATCH`  | address , avatarUrl can update **(Loggedin user only)**                       |
| `/changePassword` | `PATCH`  | change password (old password must be true than new password can be accepted) |
| `/orderHistory`   | `GET`    | Get the order hitory **(Loggedin user only)**                                 |
| `/delete`         | `DELETE` | Delete the current user **(Loggedin user only)**                              |


### admin

- Base Url - `/api/v1/admins`

| Route               | Method   | Description                                                             |
| ------------------- | -------- | ----------------------------------------------------------------------- |
| `/register`         | `POST`   | User became Admin Should verified by the any some any one admin         |
| `/login`            | `POST`   | Login the Admin                                                         |
| `/logout`           | `POST`   | Logout the Admin                                                        |
| `/viewAllUsers`     | `GET`    | Get the all userd **(Admins only)**                                     |
| `/analytics`        | `GET`    | Fetch analytics such as revenue, user sign-ups, etc. **(Admins only)**  |
| `/isAdmin/:adminId` | `GET`    | Get the details of the admin only accesss by admins   **(Admins only)** |
| `/user/:userId`     | `GET`    | Get Data of the user  **(Admins only)**                                 |
| `/user/:userId`     | `DELETE` | Delete the user **(Admins only)**                                       |

### MERCHANTS

- Base Url - `/api/v1/merchants`

| Route          | Method | Description                                                        |
| -------------- | ------ | ------------------------------------------------------------------ |
| `/register`    | `POST` | User became MERCHANTS Should verified by the any some anyone admin |
| `/login`       | `POST` | Login the MERCHANTS                                                |
| `/logout`      | `POST` | Logout the MERCHANTS                                               |
| `/allProducts` | `GET`  | Get the all prodcuts deatils whose seller is current merchant      |
| `/analytics`   | `GET`  | Fetch analytics such as revenue **(merchants only)**               |

### Product

- Base Url - `/api/v1/product`

| Route                  | Method   | Description                                                     |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `/`                    | `POST`   | Create Product **(merchants only)**                             |
| `/:productId`          | `GET`    | Get the current Deatils of Product  (All users)                 |
| `/:productId`          | `PATCH`  | Update Product info (Stock, Price as well) **(merchants only)** |
| `/:productId`          | `DELETE` | Delete Product **(merchants , admin only)**                     |
| `/discount/:productId` | `PATCH`  | Apply discount to the Product **(merchants only)**              |



### Cart

- Base Url - `/api/v1/carts`

| Route      | Method   | Description                                                 |
| ---------- | -------- | ----------------------------------------------------------- |
| `/`        | `POST`   | Create a cart (Get data in req.body can be one or multiple) |
| `/:cartId` | `GET`    | Get the carts deatils along with products                   |
| `/:cartId` | `PATCH`  | Add or remove products                                      |
| `/:cartId` | `DELETE` | Delete Cart                                                 |

### Order


- Base Url - `/api/v1/orders`

| Route          | Method | Description                                                        |



-> Unable to think more routes