### Requesting backend example:
POST<br>
\<domain\>:3000/lobby/create<br>
*in case you run the backend locally \<domain\> will be 'localhost'*<br>
<br>
Headers:<br>
Content-Type: application/json<br>
<br>
Body:
```json
{
    "name": "qwe"
}
```
Response should be:<br>
200
```json
{
    "name": "qwe",
    "players": [],
    "_id": "636f915e2b329b4bcb9ba489",
    "__v": 0
}
```
