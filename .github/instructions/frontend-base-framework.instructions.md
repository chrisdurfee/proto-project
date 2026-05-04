---
description: "Use when writing or editing JavaScript files in apps/* — covers Base Framework core philosophy (NOT React/JSX), code style, theme colors, file organization, component decomposition rules, BlankPage/Jot/hybrid atoms, data binding, lists with for/map directives, state management, conditionals, routing, HTTP/Ajax, forms, dynamic imports, and common mistakes"
applyTo: "apps/**/*.js"
---

# Frontend Base Framework

## Core Philosophy (CRITICAL: This is NOT React/Vue/JSX)

- **No Templates**: Structure defined via plain JavaScript objects
- **No JSX**: Parser turns objects into DOM
- **Children as 2nd argument**: NEVER in props
- **Reactive Data**: Use `new Data({})` NOT `useState`
- **Component instances**: Always `new Component()`, never `new Atom()`
- Composition over inheritance

## Code Style

### Braces
**Opening braces ALWAYS on new line** (except inline Atom returns):
```javascript
class Counter extends Component
{
    render()
    {
        return Div({ class: 'page' }, '[[count]]');
    }
}

// Atoms can have inline return
export const QuickAction = Atom(({ icon, label, click }) => (
    Button({ class: 'flex h-10 items-center gap-2', click }, [
        UniversalIcon({ size: 'sm' }, icon)
    ])
));
```

### Semicolons
**ALWAYS use semicolons.**

### Theme Colors (CRITICAL)
**ALWAYS use theme variables, NEVER hardcoded colors.** Based on Shadcn UI with light/dark mode.

```javascript
// ✅ CORRECT
{ class: 'text-foreground bg-background border-border' }
{ class: 'bg-primary text-primary-foreground' }
{ class: 'hover:bg-accent hover:text-accent-foreground' }

// ❌ WRONG
{ class: 'text-white bg-black border-gray-300' }
{ class: 'text-blue-500 hover:text-blue-700' }
```

**Core Colors**: `bg-background`/`text-foreground`, `bg-card`/`text-card-foreground`, `bg-popover`/`text-popover-foreground`

**Text Emphasis (4 levels)**: `text-foreground` (primary), `text-foreground-secondary`, `text-foreground-tertiary`, `text-foreground-quaternary`

**Interactive**: `bg-primary`/`text-primary-foreground`, `bg-secondary`/`text-secondary-foreground`, `bg-accent`/`text-accent-foreground`, `bg-muted`/`text-muted-foreground`

**Feedback**: `bg-destructive`/`text-destructive-foreground`, `bg-warning`/`text-warning-foreground`

**Status Tokens**: `bg-success`/`text-success`, `bg-warning`/`text-warning`, `bg-destructive`/`text-destructive`, `bg-info`/`text-info` — NEVER hardcoded `bg-green-500`, etc.

**Borders**: `border-border` — NEVER `border-white/5` (use `border-border/50`)

## File Organization

**CRITICAL**: Every meaningful visual section must live in its own file. Pages only compose named organisms/molecules — zero inline markup.

```
apps/{crm,main}/src/modules/{moduleName}/
  module.js
  components/
    models/{name}-model.js
    pages/{pageName}/
      {pageName}-page.js     # Imports organisms — NO inline markup
      organisms/{name}.js    # Full stand-alone sections
      molecules/{name}.js    # Mid-level composites
      atoms/                 # Single-purpose, grouped by concern
        cards/
        media/
        text/
```

## Component Decomposition Rules

**Rule 1 — One visual section = one file**: If you can name it, it belongs in its own file.

**Rule 2 — Pages contain zero markup**: Only import and compose organisms.
```javascript
// ✅ CORRECT
export const HomePage = () => (
    new BlankPage([RallyHeader(), GreetingSection(), FeedPostModern({ post })])
);

// ❌ WRONG — page contains inline markup
export const HomePage = () => (
    new BlankPage([Div({ class: 'flex items-center gap-3 p-4' }, [...])])
);
```

**Rule 3 — Organisms orchestrate, don't inline**: Compose molecules/atoms; extract named blocks.

**Rule 4 — Molecules factor out sub-sections**: Distinct parts (header, body, footer) → separate atoms.

**Rule 5 — Single-purpose**: Each atom/molecule/organism does exactly one thing.

**Rule 6 — 20-line threshold**: If component exceeds ~20 lines of markup, extract sub-sections.

## Component Structure (BlankPage with Props)

```javascript
import { Component, Data } from '@base-framework/base';
import { BlankPage } from '@base-framework/ui/pages';

const Props = {
    setData()
    {
        return new FeedModel({ posts: [], loading: true, filter: {} });
    },

    setupStates()
    {
        return { isOpen: false, view: 'grid' };
    },

    afterSetup()
    {
        this.loadFeed();
    },

    loadFeed()
    {
        this.data.xhr.all({}, (response) =>
        {
            if (response.success)
            {
                this.data.set({ posts: response.rows, loading: false });
            }
        });
    },

    beforeDestroy()
    {
        // cleanup subscriptions, timers
    }
};

export const HomePage = () => (
    new BlankPage(Props, [FeedSection()])
);
```

## Jot Components (Shorthand)

```javascript
import { Jot } from '@base-framework/base';

export const FeedPage = Jot(
{
    setData()
    {
        return new FeedModel({ posts: [], loading: true });
    },

    after()
    {
        this.data.xhr.all({}, (response) =>
        {
            if (response.success) { this.data.set({ posts: response.rows, loading: false }); }
        });
    },

    render()
    {
        return Div({ class: 'feed-page' }, [
            H1({ class: 'feed-title' }, this.title),
            ...(this.children ?? [])
        ]);
    },

    destroy() {}
});

// Usage: new FeedPage({ title: 'My Feed' }, [children...]);
```

## Hybrid Atoms (Base 3.5+)

Atoms that combine simplicity with component power — auto-wrapped in a component:

```javascript
import { On, If, Div } from "@base-framework/atoms";
import { Data } from "@base-framework/base";

export const ResultButton = ({ id, resolved }) =>
{
    const data = new Data({ resolved });

    return Div({ data }, [
        On('resolved', (resolved) => resolved === 1
            ? UnresolveButton({ id })
            : ResolveButton({ id }))
    ]);
};

// With custom methods:
export const ResultButtonWithMethods = ({ id, resolved }) =>
{
    const data = new Data({ resolved });

    return Div({
        data,
        methods: {
            toggleResolved: () => data.resolved = data.resolved === 1 ? 0 : 1,
            after() { console.log('Component created'); },
            destroy() { console.log('Component destroyed'); }
        }
    }, [
        On('resolved', (resolved) => resolved === 1
            ? UnresolveButton({ id }) : ResolveButton({ id }))
    ]);
};
```

## Data Binding & Reactivity

```javascript
// Simple watcher (watches this.data.status)
{ class: 'status-[[status]]' }
{ text: 'User: [[name]] Age: [[age]]' }
{ text: '[[user.profile.name]]' } // deep paths

// Multi-data watcher
{ class: ['[[propName]] [[otherPropName]]', [data1, data2]] }

// Input binding
Input({ bind: 'username' })
Input({ bind: 'user.email' })
Input({ type: 'checkbox', bind: 'accepted' })
Select({ bind: 'form.color' }, [Option({ value: 'red' }, 'Red')])

// Lists (CRITICAL)
// ✅ CORRECT - reactive directive
Div({ for: ['posts', (post) => PostCard(post)] })
// ✅ CORRECT - static directive
Div({ map: [this.data.posts, (post) => PostCard(post)] })
// ✅ Simple static
Ul([items.map(item => Li(item))])
// ❌ WRONG
Div({ children: items.map(item => ItemCard(item)) })
```

### For vs htmlFor
`for:` is a reactive directive. For HTML label `for` attribute, use `htmlFor`:
```javascript
Label({ htmlFor: 'inputId' }, 'Label Text')
Input({ id: 'inputId' })
```

## State Management

```javascript
// Data
this.data.count = 5;
this.data.set('count', 5);
this.data.set({ posts: response.rows, loading: false }); // batch
this.data.push('items', item);
this.data.refresh('key');

// States
this.state.isOpen = true;
this.state.set('isOpen', true);
this.state.toggle('isOpen');
this.state.increment('count');
this.state.set({ isOpen: true, loading: true }); // batch
```

## Conditionals & Reactive Atoms

```javascript
import { On, OnState, If, IfState, OnRoute, UseParent, OnLoad, OnStateLoad } from "@base-framework/atoms";

// Reactive (data-driven)
If('loading', true, () => LoadingSpinner()),
If('loading', false, () => ContentSection()),
On('loading', (loading, ele, parent) => loading ? LoadingSpinner() : ContentSection()),

// State-driven
IfState('isOpen', true, () => ModalContent()),
OnState('view', (view) => view === 'grid' ? GridView() : ListView()),

// Static
condition && Element(),
condition ? TrueComponent() : FalseComponent()
```

## Routing

```javascript
import { router, NavLink } from '@base-framework/base';

// Setup (in main.js)
router.setup('/app/', 'App Title');

// Navigate
app.navigate('home');
app.navigate('user/profile');
router.navigate('/settings');

// Switch (first match wins)
{ switch: [
    { uri: '/login', component: Login },
    { uri: '/users/:id', component: UserDetail },
    { component: NotFound }
] }

// Access params
class UserDetail extends Component
{
    render()
    {
        const id = this.route.id;
        return Div(`User ID: ${id}`);
    }
}

// NavLink
new NavLink({ href: '/users', text: 'Users', exact: true, activeClass: 'active' });
```

## HTTP Requests

```javascript
import { Ajax } from '@base-framework/base';

Ajax({
    method: 'GET',
    url: '/api/users',
    params: { active: 1 },
    completed: (response, xhr) =>
    {
        if (response.success) { /* handle */ }
    }
});

Ajax({
    method: 'POST',
    url: '/api/users',
    params: { name: 'John', email: 'john@example.com' },
    completed: (response) =>
    {
        if (response.success)
        {
            app.notify({ type: 'success', title: 'Success', description: 'User created' });
        }
    }
});
```

Using Ajax is fine for one-off requests but use an extended Model for scalability.

## Form Submission

```javascript
setData()
{
    return new Data({ form: { name: '', email: '' } });
}

render()
{
    return Form({ submit: (e) => this.handleSubmit(e) }, [
        Input({ bind: 'form.name', placeholder: 'Name' }),
        Input({ bind: 'form.email', placeholder: 'Email' }),
        Button({ type: 'submit' }, 'Submit')
    ]);
}

handleSubmit(e)
{
    e.preventDefault();
    this.data.xhr.add({}, (response) =>
    {
        if (response.success)
        {
            app.notify({ type: 'success', title: 'Success', description: 'Form submitted' });
            app.navigate('list');
        }
    });
}
```

## Error Handling

```javascript
this.data.xhr.all({}, (response, xhr) =>
{
    if (response.success)
    {
        this.data.items = response.rows;
    }
    else
    {
        app.notify({
            type: 'destructive',
            title: 'Error',
            description: response.message || 'Failed to load data',
            icon: Icons.warning
        });
    }
});
```

## Dynamic Imports
```javascript
// ✅ CORRECT - Function form (required for Vite)
Import(() => import('./components/heavy.js'))
// ✅ Conditional
condition && Import(() => import('./components/heavy-component.js'))
// ❌ WRONG
Import('./file.js')
```

## Common Mistakes
1. ❌ DON'T pass children in props: `Div({ children: [...] })`
2. ❌ DON'T use `new` with Atoms: `new Button()`
3. ❌ DON'T forget `new` with Components: `ToggleButton()` — needs `new`
4. ❌ DON'T use `variant: 'default'` — use `variant: 'primary'`
5. ❌ DON'T use `.map()` for reactive lists — use `for` or `map` directive
6. ❌ DON'T call `render()` directly
7. ❌ DON'T access DOM before `afterSetup()`
8. ❌ DON'T use `border-white/5` — use `border-border/50`
9. ❌ DON'T use hardcoded colors — use theme variables
10. ❌ DON'T write inline markup in page components — extract to organisms
11. ❌ DON'T exceed ~20 lines per component — extract sub-sections
