## Description
Service features 3 endpoints for auth functionality:
- /register
- /login
- /validate

## Usage examples:
*in case you run the backend locally domain will be localhost*<br>
*port is 3002 unless you've changed the compose file*<br><br>

### Registering
POST<br>
\<domain\>:\<port\>/register<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Body:
```json
{
    "username": "the_dude",
    "password": "my_super_secure_password"
}
```
Response should be:<br>
201
```json
{
    "user": {
        "username": "neterpila",
        "_id": "63bc18627a91aed43b36675b",
        "__v": 0
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vTmV0ZXJwaWxhL1JvY2tfcGFwZXJfc2Npc3NvcnNfYmFja2VuZCIsInN1YiI6InRoZV9kdWRlIiwiaWF0IjoxNjczMjcxMzk0fQ.SliSn5OPfNt4z7hly2z0i3LkWb8qfqwFa_iIjEN6sM4"
}
```

### Logging in
POST<br>
\<domain\>:\<port\>/login<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Body:
```json
{
    "username": "the_dude",
    "password": "my_super_secure_password"
}
```
Response should be:<br>
200
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2dpdGh1Yi5jb20vTmV0ZXJwaWxhL1JvY2tfcGFwZXJfc2Npc3NvcnNfYmFja2VuZCIsInN1YiI6InRoZV9kdWRlIiwiaWF0IjoxNjczMjcxMzk0fQ.SliSn5OPfNt4z7hly2z0i3LkWb8qfqwFa_iIjEN6sM4"
}
```
Or:<br>
401 - in case the credentials are not valid

### Verifying the token (for internal use only)
GET<br>
\<domain\>:\<port\>/validate?token=abc.123.qwe<br>
<br>
Query params:
- token - <your_token>
<br>

Responses:<br>
200<br>
Body:<br>
```json
{
    "iss": "https://github.com/Neterpila/Rock_paper_scissors_backend",
    "sub": "neterpila",
    "iat": 1673271679
}
```
Or:<br>
400<br>
Body:<br>
```json
{
    "message": "Token is invalid"
}
```
