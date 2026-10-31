# MMM-HATodo

![MMM-HATodo screenshot](screenshot.png)

A [MagicMirror²](https://magicmirror.builders/) module that shows the open items from a [Home Assistant](https://www.home-assistant.io/) to-do list, with optional due dates. If the list is longer than fits on screen, the module cycles through it a page at a time.

Items are added and checked off in Home Assistant (its app, dashboards, or any integration that feeds the list). The mirror only displays them.

> **AI disclosure:** this module was written with the help of an AI assistant (Claude, by Anthropic). See [AI disclosure](#ai-disclosure) below.

**Status:** actively maintained.

## Requirements

- A Home Assistant instance with a to-do list entity (for example Local To-do, Google Tasks, or Shopping List), on version 2023.12 or newer (the `todo.get_items` action was added in 2023.12)
- A Home Assistant long-lived access token (profile page > Security > Long-lived access tokens)
- Node 18+ (uses Node's built-in `fetch`)

## Install

```
cd ~/MagicMirror/modules
git clone https://github.com/PeanutToes6/MMM-HATodo
```

No `npm install` needed.

## Config

```js
{
  module: "MMM-HATodo",
  position: "top_left",
  header: "To Do",
  config: {
    haUrl: "http://your.homeassistant.local",
    token: "YOUR_LONG_LIVED_TOKEN",
    entity: "todo.your_list",
    maxItems: 10,
    cycleInterval: 60 * 1000
  }
}
```

| Option              | Default                           | Description                                                             |
|---------------------|-----------------------------------|-------------------------------------------------------------------------|
| `haUrl`             | `"http://homeassistant.local:8123"` | Address of your Home Assistant instance                               |
| `token`             | `""`                              | Long-lived access token (required)                                      |
| `entity`            | `"todo.my_tasks"`                 | Entity ID of the to-do list. Change this to your own list               |
| `maxItems`          | `10`                              | Items shown at once. Longer lists are split into pages of this size     |
| `cycleInterval`     | `10000`                           | How long each page is shown, in ms. Only matters if there is more than one page |
| `showPageIndicator` | `true`                            | Show a small "1 / 3" under the list when there is more than one page    |
| `updateInterval`    | `300000`                          | How often to fetch the list from Home Assistant, in ms (5 minutes)      |
| `showDueDates`      | `true`                            | Show the due date (as `MMM D`) next to items that have one              |
| `animationSpeed`    | `1000`                            | Fade time in ms when the list or page changes                           |

## Notes

- Only items that still need action are shown. Completed items are hidden.
- With 25 items and `maxItems: 10` you get pages of 10, 10 and 5. The last page can be shorter, so the module's height changes slightly on that page.
- When the list refreshes, the module stays on the page it is showing. If the list has shrunk and that page no longer exists, it returns to page 1.
- Cycling pauses while the module is hidden and resumes when it is shown again.
- If a request fails for any reason, including a wrong `entity`, the module shows "Can't reach Home Assistant". The MagicMirror log has the exact HTTP status. Check the entity ID first if Home Assistant is up.

## Security note

MagicMirror serves `config.js` to the browser, so the token is readable by anything that can open the mirror's page. That is usually fine on a home network, but use a token you are happy to revoke, and do not expose your mirror to the internet.

## Credits

- Data comes from the [Home Assistant REST API](https://developers.home-assistant.io/docs/api/rest/)

## AI disclosure

The code in this module was written by Claude, an AI assistant made by Anthropic, working from my instructions and feedback. I tested it on a real MagicMirror, and I published and maintain it. I am not a programmer, but I wanted to fill a niche in my MagicMirror, and AI made that possible for me. If you prefer not to use or support AI-assisted software, you are welcome to skip this module, and I understand.

## License

MIT
