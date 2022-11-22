## Description
Service features 2 endpoints for auth functionality:
- /register
- /login

As well as a protected endpoint for testing purposes:
- /protected_resource

*protected_resource* endpoint requires a presence of a valid jwt token in the request. If the token is present and is valid, it will return a response with some success text. Else - 401 response.

## Usage examples:
*in case you run the backend locally domain will be localhost*<br>
*port is 3002 unless you've changed the compose file*<br><br>

**First you need to create an account:**<br>
POST<br>
\<domain\>:\<port\>/register<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Body:
```json
{
    "nickname": "the_dude",
    "password": "my_super_secure_password"
}
```
Response should be:<br>
201
```json
{
    "nickname": "the_dude",
    "_id": "637251491bd848a9355cac3c",
    "__v": 0,
    "token": "abcdef1234.ghijklmnop5678.qrstuvwxyz901234"
}
```

Then you need to store your token somewhere. You're gonna need it to access the protected resource.<br><br>

**In case you lost your token (or it expired), you can login in order to issue a new one:**<br>
POST<br>
\<domain\>:\<port\>/login<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Body:
```json
{
    "nickname": "the_dude",
    "password": "my_super_secure_password"
}
```
Response should be:<br>
200
```json
{
    "nickname": "the_dude",
    "_id": "637251491bd848a9355cac3c",
    "__v": 0,
    "token": "qwert0987.asdfghjk1234567.zxcvbnm345678"
}
```

**When you have a token, you may access the protected endpoint:**<br>
GET<br>
\<domain\>:\<port\>/protected_resource<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Now there are multiple ways of including the token in the request:
1. Send it in request body:
```json
{
    "token": "qwert0987.asdfghjk1234567.zxcvbnm345678"
}
```
2. Send it as a query parameter:<br>
\<domain\>:\<port\>/protected_resource?token=qwert0987.asdfghjk1234567.zxcvbnm345678<br>
3. Send it as a request header:<br>
x-access-token: qwert0987.asdfghjk1234567.zxcvbnm345678<br>
or<br>
Authorization: qwert0987.asdfghjk1234567.zxcvbnm345678<br><br>

Response should be:<br>
200
```json
{
    "message": "Welcome the_dude! You gained access to classified information."
}
```

If something is wrong with the token, you'll get 401.