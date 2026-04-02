sequenceDiagram
participant browser
participant server

    Note right of browser: The user writes a note and clicks the "Save" button
    Note right of browser: JS code adds the note to the local list and rerenders the notes on the page

    browser->>server: POST https://studies.cs.helsinki.fi/exampleapp/new_note_spa
    activate server
    Note left of server: The server saves the new note to the notes array
    server-->>browser: HTTP Status Code 201 Created
    deactivate server

    Note right of browser: The browser stays on the same page and performs no further requests
