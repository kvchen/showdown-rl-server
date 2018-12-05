# API

## Endpoints

### POST /start

Starts a new battle. A payload containing the newly-created battle ID and its
features are returned.

```json
{
  "id": "asdf",
  "data": { "foo": "bar" }
}
```

### POST /{:battleID}/move

Copies a battle and performs both player moves on the new copy. Returns the
battle ID of the new copy.

### DELETE /{:battleID}

Removes a battle and all its descendents from memory.
