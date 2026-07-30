# Frontend Development Context

You are working in the **apps/** directory (JavaScript frontend).

**CRITICAL: This is NOT React/Vue/JSX - It's Base Framework**

## Quick Patterns

### Component Structure
```javascript
import { Component, Data } from '@base-framework/base';
import { BlankPage } from '@base-framework/ui/pages';

const Props =
{
    /**
     * Set up reactive data
     *
     * @returns {Data}
     */
    setData()
    {
        return new FeedModel({
            posts: [],
            loading: true,
            filter: {}
        });
    },

    /**
     * Set up local state
     *
     * @returns {object}
     */
    setupStates()
    {
        return {
            isOpen: false,
            view: 'grid'
        };
    },

    /**
     * After DOM is created
     */
    afterSetup()
    {
        this.loadFeed();
    },

    /**
     * Load feed data from API
     */
    loadFeed()
    {
        this.data.xhr.all({}, (response) =>
        {
            if (response.success)
            {
                this.data.set('posts', response.rows);
                this.data.set('loading', false);
            }
        });
    },

    /**
     * Cleanup before destroy
     */
    beforeDestroy()
    {
        // Clean up subscriptions, timers, etc.
    }
}

/**
 * HomePage
 *
 * Main home page combining feed and assistant
 *
 * @returns {BlankPage}
 */
export const HomePage = () => (
    new BlankPage(Props, [
        Div({ class: 'home-page' }, [
            FeedSection()
        ])
    ])
);
```

### Atoms (No `new`)
```javascript
export const QuickAction = Atom(({ icon, label, click }) => (
    Button({ class: 'btn', click }, [
        UniversalIcon({ size: 'sm' }, icon),
        Span(label)
    ])
));
```

### Icons
```javascript
import { UniversalIcon } from '@base-framework/ui/atoms';

UniversalIcon({ size: 'md' }, 'home');
```

Icon names are [Material Symbols](https://fonts.google.com/icons) identifiers passed as plain strings — never the deprecated `Icon`/`Icons` heroicon pattern.

### Data Binding
```javascript
// Watchers
{ class: 'status-[[status]]' }

// Input binding
Input({ bind: 'username' })

// Reactive lists
Div({ for: ['posts', (post) => PostCard(post)] })
```

## Critical Rules

1. **Braces on new line** (except inline Atom returns)
2. **Always semicolons**
3. **Theme variables** (never `text-white`, `bg-black`)
4. **Children as 2nd arg** (never `{ children: [...] }`)
5. **No `new` for Atoms** (`Button()` not `new Button()`)
6. **Yes `new` for Components** (`new MyComponent()`)

## Theme Colors

| Use | Don't Use |
|-----|-----------|
| `text-foreground` | `text-white` |
| `bg-background` | `bg-black` |
| `bg-primary` | `bg-blue-500` |
| `border-border` | `border-gray-300` |
| `text-muted-foreground` | `text-gray-500` |

## App Shell

`app-controller.js` in each app (`main`, `crm`, `developer`) is a thin facade that delegates to `src/app-controller/*` sub-modules (`bootstrap.js`, `splash.js`, `font-loading.js`, `auth-actions.js`, `user-data.js`, ...). Add new boot-time concerns as a new sub-module, never inline into the facade. See `frontend-base-framework.mdc` for the full breakdown (CSRF-ready guard, stale-chunk recovery, route-loading progress, splash screen, service worker).

## Full Documentation

See `.cursor/rules/*.mdc` (or `.github/instructions/*.instructions.md`) for complete frontend patterns:
- `frontend-base-framework.mdc` — core philosophy, code style, component structure, app shell/bootstrap
- `frontend-ui-components.mdc` — Base UI components, design tokens, shared `@components/` library
- `anti-patterns.mdc` — WRONG vs CORRECT reference for both backend and frontend
