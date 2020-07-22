
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.24.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const active = writable();

    const createWritableStore = (key, startValue) => {
      const { subscribe, set } = writable(startValue);

      return {
        subscribe,
        set,
        useLocalStorage: () => {
          const json = localStorage.getItem(key);
          if (json) {
            set(JSON.parse(json));
          }

          subscribe((current) => {
            localStorage.setItem(key, JSON.stringify(current));
          });
        },
      };
    };

    const tasks = createWritableStore("Tasks", []);

    const projects = createWritableStore("Projects", []);

    const stats = createWritableStore("Stats", [
      { name: "Storage Usage", value: null },
      { name: "Last Visit", value: null },
      { name: "Longest String", value: null },
      { name: "Favorite Project", value: null },
      { name: "Oldest Project", value: null },
      { name: "Oldest Task", value: null },
    ]);

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/Components/Stats.svelte generated by Svelte v3.24.0 */
    const file = "src/Components/Stats.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (33:4) {#if $stats.length > 0}
    function create_if_block(ctx) {
    	let dl;
    	let each_value = /*$stats*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			dl = element("dl");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(dl, "class", "uk-description-list");
    			add_location(dl, file, 33, 6, 1005);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dl, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(dl, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$stats*/ 1) {
    				each_value = /*$stats*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(dl, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dl);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:4) {#if $stats.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (35:8) {#each $stats as stat}
    function create_each_block(ctx) {
    	let dt;
    	let t0_value = /*stat*/ ctx[1].name + "";
    	let t0;
    	let dd;
    	let html_tag;
    	let raw_value = /*stat*/ ctx[1].value + "";
    	let t1;
    	let hr;

    	const block = {
    		c: function create() {
    			dt = element("dt");
    			t0 = text(t0_value);
    			dd = element("dd");
    			t1 = space();
    			hr = element("hr");
    			attr_dev(dt, "class", "uk-text-emphasis");
    			add_location(dt, file, 35, 10, 1079);
    			html_tag = new HtmlTag(t1);
    			attr_dev(dd, "class", "uk-margin-left uk-margin-right");
    			add_location(dd, file, 36, 10, 1135);
    			add_location(hr, file, 39, 10, 1236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, dt, anchor);
    			append_dev(dt, t0);
    			insert_dev(target, dd, anchor);
    			html_tag.m(raw_value, dd);
    			append_dev(dd, t1);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$stats*/ 1 && t0_value !== (t0_value = /*stat*/ ctx[1].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$stats*/ 1 && raw_value !== (raw_value = /*stat*/ ctx[1].value + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(dt);
    			if (detaching) detach_dev(dd);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:8) {#each $stats as stat}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let button0;
    	let t0;
    	let h2;
    	let t2;
    	let t3;
    	let p;
    	let t5;
    	let div0;
    	let a0;
    	let img0;
    	let t6;
    	let a1;
    	let img1;
    	let t7;
    	let a2;
    	let img2;
    	let t8;
    	let button1;
    	let mounted;
    	let dispose;
    	let if_block = /*$stats*/ ctx[0].length > 0 && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			t0 = space();
    			h2 = element("h2");
    			h2.textContent = "Nerd Stats";
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			p = element("p");
    			p.textContent = "The following technologies were used to build this application.";
    			t5 = space();
    			div0 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t6 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t7 = space();
    			a2 = element("a");
    			img2 = element("img");
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Reset Storage";
    			attr_dev(button0, "class", "uk-offcanvas-close");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "uk-close", "");
    			add_location(button0, file, 30, 4, 861);
    			attr_dev(h2, "class", "uk-heading-small");
    			add_location(h2, file, 31, 4, 926);
    			add_location(p, file, 43, 4, 1285);
    			attr_dev(img0, "data-src", "images/electron.png");
    			attr_dev(img0, "width", "64");
    			attr_dev(img0, "height", "64");
    			attr_dev(img0, "alt", "electron");
    			attr_dev(img0, "uk-img", "");
    			attr_dev(img0, "uk-tooltip", "Electron.js");
    			add_location(img0, file, 46, 8, 1491);
    			attr_dev(a0, "href", "https://www.electronjs.org/");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file, 45, 6, 1428);
    			attr_dev(img1, "data-src", "images/uikit.png");
    			attr_dev(img1, "width", "64");
    			attr_dev(img1, "height", "64");
    			attr_dev(img1, "alt", "uikit");
    			attr_dev(img1, "uk-img", "");
    			attr_dev(img1, "uk-tooltip", "UIkit");
    			add_location(img1, file, 55, 8, 1734);
    			attr_dev(a1, "href", "https://getuikit.com/");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file, 54, 6, 1677);
    			attr_dev(img2, "data-src", "images/svelte.png");
    			attr_dev(img2, "width", "64");
    			attr_dev(img2, "height", "64");
    			attr_dev(img2, "alt", "svelte");
    			attr_dev(img2, "uk-img", "");
    			attr_dev(img2, "uk-tooltip", "Svelte");
    			add_location(img2, file, 64, 8, 1963);
    			attr_dev(a2, "href", "https://svelte.dev/");
    			attr_dev(a2, "target", "_blank");
    			add_location(a2, file, 63, 6, 1908);
    			attr_dev(div0, "class", "uk-flex uk-flex-around uk-flex-middle uk-margin");
    			add_location(div0, file, 44, 4, 1360);
    			attr_dev(button1, "class", "uk-button uk-button-danger uk-margin-medium-top uk-width-1-1");
    			add_location(button1, file, 73, 4, 2149);
    			attr_dev(div1, "class", "uk-offcanvas-bar uk-width-1-2@s uk-width-1-3@m");
    			add_location(div1, file, 29, 2, 796);
    			attr_dev(div2, "id", "nerdStats");
    			attr_dev(div2, "uk-offcanvas", "overlay: true");
    			add_location(div2, file, 28, 0, 744);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t0);
    			append_dev(div1, h2);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(a0, img0);
    			append_dev(div0, t6);
    			append_dev(div0, a1);
    			append_dev(a1, img1);
    			append_dev(div0, t7);
    			append_dev(div0, a2);
    			append_dev(a2, img2);
    			append_dev(div1, t8);
    			append_dev(div1, button1);

    			if (!mounted) {
    				dispose = listen_dev(button1, "click", resetStorage, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$stats*/ ctx[0].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function resetStorage() {
    	UIkit.modal.confirm(`<h1 class='uk-heading-small'>Reset Storage</h1>Are you sure that you would like to reset storage?<br/><br/><em>Note: This cannot be undone.</em>`).then(
    		() => {
    			localStorage.clear();

    			return UIkit.notification("<div class='uk-text-center'><span uk-icon='icon: database'></span> Storage Reset</div>", {
    				status: "danger",
    				pos: "bottom-center",
    				timeout: 3000
    			});
    		},
    		() => {
    			return false;
    		}
    	);
    }

    function instance($$self, $$props, $$invalidate) {
    	let $stats;
    	validate_store(stats, "stats");
    	component_subscribe($$self, stats, $$value => $$invalidate(0, $stats = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stats> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Stats", $$slots, []);
    	$$self.$capture_state = () => ({ fly, fade, stats, resetStorage, $stats });
    	return [$stats];
    }

    class Stats extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stats",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Components/Task.svelte generated by Svelte v3.24.0 */
    const file$1 = "src/Components/Task.svelte";

    // (73:4) {#if $active === 'All Tasks'}
    function create_if_block$1(ctx) {
    	let span;
    	let t_value = /*object*/ ctx[0].project + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "uk-label uk-margin-right");
    			attr_dev(span, "uk-tooltip", "title: Project Name; pos: right; delay: 500;");
    			add_location(span, file$1, 73, 6, 2052);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*object*/ 1 && t_value !== (t_value = /*object*/ ctx[0].project + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(73:4) {#if $active === 'All Tasks'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let li3;
    	let form;
    	let t0;
    	let div;
    	let span;
    	let raw_value = /*object*/ ctx[0].name + "";
    	let t1;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t3;
    	let li2;
    	let a2;
    	let li3_data_tags_value;
    	let mounted;
    	let dispose;
    	let if_block = /*$active*/ ctx[1] === "All Tasks" && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			li3 = element("li");
    			form = element("form");
    			if (if_block) if_block.c();
    			t0 = space();
    			div = element("div");
    			span = element("span");
    			t1 = space();
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t3 = space();
    			li2 = element("li");
    			a2 = element("a");
    			attr_dev(span, "class", "custom_taskname uk-text-large svelte-q21xoi");
    			add_location(span, file$1, 80, 6, 2249);
    			attr_dev(div, "class", "uk-flex-1");
    			add_location(div, file$1, 79, 4, 2219);
    			attr_dev(a0, "href", "#");
    			attr_dev(a0, "uk-icon", "icon: check");
    			attr_dev(a0, "uk-tooltip", "title: Mark Complete; pos: top; delay: 1000;");
    			attr_dev(a0, "class", "svelte-q21xoi");
    			add_location(a0, file$1, 86, 8, 2412);
    			add_location(li0, file$1, 85, 6, 2399);
    			attr_dev(a1, "href", "#");
    			attr_dev(a1, "uk-icon", "icon: pencil");
    			attr_dev(a1, "uk-tooltip", "title: Edit Task; pos: top; delay: 1000;");
    			add_location(a1, file$1, 93, 8, 2606);
    			add_location(li1, file$1, 92, 6, 2593);
    			attr_dev(a2, "href", "#");
    			attr_dev(a2, "uk-icon", "icon: close");
    			attr_dev(a2, "uk-tooltip", "title: Delete Task; pos: top; delay: 1000;");
    			attr_dev(a2, "class", "svelte-q21xoi");
    			add_location(a2, file$1, 100, 8, 2797);
    			add_location(li2, file$1, 99, 6, 2784);
    			attr_dev(ul, "class", "uk-iconnav uk-padding-remove");
    			add_location(ul, file$1, 84, 4, 2351);
    			attr_dev(form, "class", "uk-card uk-card-default uk-card-body uk-flex uk-flex-between\n    uk-flex-middle uk-width-3-4@s uk-width-2-3@m uk-width-1-2@l uk-margin-auto\n    uk-box-shadow-small");
    			add_location(form, file$1, 68, 2, 1829);
    			attr_dev(li3, "data-tags", li3_data_tags_value = /*object*/ ctx[0].project);
    			add_location(li3, file$1, 66, 0, 1717);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li3, anchor);
    			append_dev(li3, form);
    			if (if_block) if_block.m(form, null);
    			append_dev(form, t0);
    			append_dev(form, div);
    			append_dev(div, span);
    			span.innerHTML = raw_value;
    			append_dev(form, t1);
    			append_dev(form, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			append_dev(li2, a2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						a0,
    						"click",
    						function () {
    							if (is_function(/*editTask*/ ctx[2](/*object*/ ctx[0]))) /*editTask*/ ctx[2](/*object*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						a1,
    						"click",
    						function () {
    							if (is_function(/*editTask*/ ctx[2](/*object*/ ctx[0]))) /*editTask*/ ctx[2](/*object*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						a2,
    						"click",
    						function () {
    							if (is_function(/*deleteTask*/ ctx[3](/*object*/ ctx[0]))) /*deleteTask*/ ctx[3](/*object*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (/*$active*/ ctx[1] === "All Tasks") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(form, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*object*/ 1 && raw_value !== (raw_value = /*object*/ ctx[0].name + "")) span.innerHTML = raw_value;
    			if (dirty & /*object*/ 1 && li3_data_tags_value !== (li3_data_tags_value = /*object*/ ctx[0].project)) {
    				attr_dev(li3, "data-tags", li3_data_tags_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li3);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $tasks;
    	let $active;
    	validate_store(tasks, "tasks");
    	component_subscribe($$self, tasks, $$value => $$invalidate(4, $tasks = $$value));
    	validate_store(active, "active");
    	component_subscribe($$self, active, $$value => $$invalidate(1, $active = $$value));
    	let { object } = $$props;

    	function editTask(object) {
    		const name = UIkit.modal.prompt("Edit Task", object.name).then(text => {
    			if (text !== object.name && text !== null) {
    				const target = $tasks.filter(task => task.name === object.name)[0];
    				target.name = text;
    				target.dateModified = Date.now();
    				set_store_value(tasks, $tasks = [...$tasks]);

    				return UIkit.notification("<div class='uk-text-center'><span uk-icon='icon: file-edit'></span> Task Edited</div>", {
    					status: "primary",
    					pos: "bottom-center",
    					timeout: 1500
    				});
    			} else {
    				return false;
    			}
    		});
    	}

    	function deleteTask(object) {
    		UIkit.modal.confirm(`<h1 class='uk-heading-small'>Delete Task</h1>Are you sure that you would like to delete <b>${object.name}</b>?<br/><br/><em>Note: This cannot be undone.</em>`).then(
    			() => {
    				const refId = $tasks.findIndex(obj => obj.name === object.name);
    				$tasks.splice(refId, 1);
    				set_store_value(tasks, $tasks = [...$tasks]);

    				return UIkit.notification("<div class='uk-text-center'><span uk-icon='icon: close'></span> Task Deleted</div>", {
    					status: "danger",
    					pos: "bottom-center",
    					timeout: 1500
    				});
    			},
    			() => {
    				return false;
    			}
    		);
    	}

    	const writable_props = ["object"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Task> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Task", $$slots, []);

    	$$self.$set = $$props => {
    		if ("object" in $$props) $$invalidate(0, object = $$props.object);
    	};

    	$$self.$capture_state = () => ({
    		object,
    		tasks,
    		active,
    		editTask,
    		deleteTask,
    		$tasks,
    		$active
    	});

    	$$self.$inject_state = $$props => {
    		if ("object" in $$props) $$invalidate(0, object = $$props.object);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [object, $active, editTask, deleteTask];
    }

    class Task extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { object: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Task",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*object*/ ctx[0] === undefined && !("object" in props)) {
    			console.warn("<Task> was created without expected prop 'object'");
    		}
    	}

    	get object() {
    		throw new Error("<Task>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set object(value) {
    		throw new Error("<Task>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Components/List.svelte generated by Svelte v3.24.0 */

    const file$2 = "src/Components/List.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (26:6) {#if $active !== 'All Tasks'}
    function create_if_block_2(ctx) {
    	let li;
    	let a;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			attr_dev(a, "href", "#");
    			attr_dev(a, "uk-icon", "icon: pencil");
    			attr_dev(a, "uk-toggle", "target: #projectModal");
    			add_location(a, file$2, 27, 10, 693);
    			add_location(li, file$2, 26, 8, 678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:6) {#if $active !== 'All Tasks'}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {:else}
    function create_else_block(ctx) {
    	let ul;
    	let li;
    	let a;
    	let t1;
    	let t2;
    	let hr;
    	let t3;
    	let p;
    	let t4_value = `Task Count: ${/*projectTaskCount*/ ctx[1]}` + "";
    	let t4;
    	let t5;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$projects*/ ctx[3];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const if_block_creators = [create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$tasks*/ ctx[2].length > 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			a.textContent = "All Tasks";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			hr = element("hr");
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(a, "href", "#");
    			add_location(a, file$2, 61, 8, 1653);
    			attr_dev(li, "class", "uk-active uk-position-relative");
    			attr_dev(li, "uk-filter-control", "");
    			add_location(li, file$2, 57, 6, 1518);
    			attr_dev(ul, "class", "uk-subnav uk-margin-auto uk-subnav-pill uk-text-small\n      uk-background-default uk-padding-small");
    			attr_dev(ul, "uk-sticky", "");
    			add_location(ul, file$2, 53, 4, 1378);
    			attr_dev(hr, "class", "uk-divider-icon");
    			add_location(hr, file$2, 76, 4, 2163);
    			attr_dev(p, "class", "uk-text-meta uk-text-right");
    			add_location(p, file$2, 77, 4, 2198);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li);
    			append_dev(li, a);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t4);
    			insert_dev(target, t5, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(li, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects, $active*/ 9) {
    				each_value_1 = /*$projects*/ ctx[3];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if ((!current || dirty & /*projectTaskCount*/ 2) && t4_value !== (t4_value = `Task Count: ${/*projectTaskCount*/ ctx[1]}` + "")) set_data_dev(t4, t4_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t5);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(53:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (39:2) {#if $projects.length === 0}
    function create_if_block$2(ctx) {
    	let div;
    	let p;
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("No Projects Exist\n        ");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Create a project to begin";
    			add_location(br, file$2, 44, 8, 1178);
    			attr_dev(span, "class", "uk-text-primary uk-text-small uk-button");
    			add_location(span, file$2, 45, 8, 1193);
    			attr_dev(p, "class", "uk-heading-small uk-text-danger uk-text-center uk-margin-auto\n        uk-margin-auto-top uk-margin-auto-bottom");
    			add_location(p, file$2, 40, 6, 1013);
    			attr_dev(div, "class", "uk-flex");
    			attr_dev(div, "uk-height-viewport", "expand:true");
    			add_location(div, file$2, 39, 4, 952);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    			append_dev(p, span);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", newProject, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(39:2) {#if $projects.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (64:6) {#each $projects as project, index}
    function create_each_block_1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*project*/ ctx[10].name + "";
    	let t0;
    	let t1;
    	let li_uk_filter_control_value;
    	let li_data_name_value;
    	let li_data_taskcount_value;
    	let li_data_datecreated_value;
    	let li_data_datemodified_value;
    	let mounted;
    	let dispose;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[5](/*project*/ ctx[10], ...args);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "#");
    			add_location(a, file$2, 72, 10, 2090);
    			attr_dev(li, "class", "uk-position-relative");
    			attr_dev(li, "uk-filter-control", li_uk_filter_control_value = `[data-tags*="${/*project*/ ctx[10].name}"]`);
    			attr_dev(li, "data-name", li_data_name_value = /*project*/ ctx[10].name);
    			attr_dev(li, "data-taskcount", li_data_taskcount_value = /*project*/ ctx[10].taskCount);
    			attr_dev(li, "data-datecreated", li_data_datecreated_value = /*project*/ ctx[10].dateCreated);
    			attr_dev(li, "data-datemodified", li_data_datemodified_value = /*project*/ ctx[10].dateModified);
    			add_location(li, file$2, 64, 8, 1741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);

    			if (!mounted) {
    				dispose = listen_dev(li, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$projects*/ 8 && t0_value !== (t0_value = /*project*/ ctx[10].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$projects*/ 8 && li_uk_filter_control_value !== (li_uk_filter_control_value = `[data-tags*="${/*project*/ ctx[10].name}"]`)) {
    				attr_dev(li, "uk-filter-control", li_uk_filter_control_value);
    			}

    			if (dirty & /*$projects*/ 8 && li_data_name_value !== (li_data_name_value = /*project*/ ctx[10].name)) {
    				attr_dev(li, "data-name", li_data_name_value);
    			}

    			if (dirty & /*$projects*/ 8 && li_data_taskcount_value !== (li_data_taskcount_value = /*project*/ ctx[10].taskCount)) {
    				attr_dev(li, "data-taskcount", li_data_taskcount_value);
    			}

    			if (dirty & /*$projects*/ 8 && li_data_datecreated_value !== (li_data_datecreated_value = /*project*/ ctx[10].dateCreated)) {
    				attr_dev(li, "data-datecreated", li_data_datecreated_value);
    			}

    			if (dirty & /*$projects*/ 8 && li_data_datemodified_value !== (li_data_datemodified_value = /*project*/ ctx[10].dateModified)) {
    				attr_dev(li, "data-datemodified", li_data_datemodified_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(64:6) {#each $projects as project, index}",
    		ctx
    	});

    	return block;
    }

    // (87:4) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let p;
    	let t0;
    	let br;
    	let t1;
    	let span;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("No tasks in this project\n          ");
    			br = element("br");
    			t1 = space();
    			span = element("span");
    			span.textContent = "Add a Task";
    			add_location(br, file$2, 92, 10, 2720);
    			attr_dev(span, "class", "uk-text-primary uk-text-small uk-button");
    			add_location(span, file$2, 93, 10, 2737);
    			attr_dev(p, "class", "uk-heading-small uk-text-danger uk-text-center uk-margin-auto\n          uk-margin-auto-top uk-margin-auto-bottom");
    			add_location(p, file$2, 88, 8, 2540);
    			attr_dev(div, "class", "uk-flex");
    			attr_dev(div, "uk-height-viewport", "expand:true");
    			add_location(div, file$2, 87, 6, 2477);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, br);
    			append_dev(p, t1);
    			append_dev(p, span);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", newTask, false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(87:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (81:4) {#if $tasks.length > 0}
    function create_if_block_1(ctx) {
    	let ul;
    	let current;
    	let each_value = /*$tasks*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "id", "taskList");
    			attr_dev(ul, "class", "uk-list js-filter");
    			add_location(ul, file$2, 81, 6, 2322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$tasks*/ 4) {
    				each_value = /*$tasks*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(81:4) {#if $tasks.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (83:8) {#each $tasks as task}
    function create_each_block$1(ctx) {
    	let task;
    	let current;

    	task = new Task({
    			props: { object: /*task*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(task.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(task, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const task_changes = {};
    			if (dirty & /*$tasks*/ 4) task_changes.object = /*task*/ ctx[7];
    			task.$set(task_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(task.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(task.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(task, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(83:8) {#each $tasks as task}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let ul;
    	let li;
    	let a;
    	let t0;
    	let t1;
    	let div2;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	let if_block0 = /*$active*/ ctx[0] !== "All Tasks" && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$projects*/ ctx[3].length === 0) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div2 = element("div");
    			if_block1.c();
    			attr_dev(a, "href", "#");
    			attr_dev(a, "uk-icon", "icon: plus");
    			attr_dev(a, "uk-toggle", "target: #entryModal");
    			add_location(a, file$2, 23, 8, 554);
    			add_location(li, file$2, 22, 6, 541);
    			attr_dev(ul, "class", "uk-iconnav");
    			add_location(ul, file$2, 21, 4, 511);
    			attr_dev(div0, "class", "uk-flex uk-flex-between");
    			add_location(div0, file$2, 20, 2, 469);
    			attr_dev(div1, "class", "uk-section-xsmall");
    			add_location(div1, file$2, 19, 0, 435);
    			attr_dev(div2, "class", "uk-section-xsmall");
    			attr_dev(div2, "uk-filter", "target: .js-filter");
    			add_location(div2, file$2, 37, 0, 854);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li);
    			append_dev(li, a);
    			append_dev(ul, t0);
    			if (if_block0) if_block0.m(ul, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			if_blocks[current_block_type_index].m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$active*/ ctx[0] !== "All Tasks") {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(ul, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div2, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $active;
    	let $tasks;
    	let $projects;
    	validate_store(active, "active");
    	component_subscribe($$self, active, $$value => $$invalidate(0, $active = $$value));
    	validate_store(tasks, "tasks");
    	component_subscribe($$self, tasks, $$value => $$invalidate(2, $tasks = $$value));
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(3, $projects = $$value));
    	projects.useLocalStorage();
    	tasks.useLocalStorage();
    	set_store_value(active, $active = "All Tasks");
    	let addActionRadio;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("List", $$slots, []);
    	const click_handler = () => set_store_value(active, $active = "All Tasks");
    	const click_handler_1 = project => set_store_value(active, $active = project.name);

    	$$self.$capture_state = () => ({
    		onMount,
    		projects,
    		tasks,
    		active,
    		Task,
    		addActionRadio,
    		$active,
    		projectTaskCount,
    		$tasks,
    		$projects
    	});

    	$$self.$inject_state = $$props => {
    		if ("addActionRadio" in $$props) addActionRadio = $$props.addActionRadio;
    		if ("projectTaskCount" in $$props) $$invalidate(1, projectTaskCount = $$props.projectTaskCount);
    	};

    	let projectTaskCount;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$active, $tasks, $projects*/ 13) {
    			 $$invalidate(1, projectTaskCount = $active && $active === "All Tasks"
    			? $tasks.length
    			: $projects.filter(project => project.name === $active)[0].taskCount);
    		}
    	};

    	return [$active, projectTaskCount, $tasks, $projects, click_handler, click_handler_1];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Components/EntryModal.svelte generated by Svelte v3.24.0 */
    const file$3 = "src/Components/EntryModal.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	return child_ctx;
    }

    // (92:10) {#each entryOptions as entry}
    function create_each_block_1$1(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*entry*/ ctx[16] + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "class", "uk-radio");
    			attr_dev(input, "name", "entryType");
    			input.__value = input_value_value = /*entry*/ ctx[16];
    			input.value = input.__value;
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file$3, 93, 14, 2549);
    			attr_dev(label, "class", "uk-margin-small-right");
    			add_location(label, file$3, 92, 12, 2497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = input.__value === /*entryType*/ ctx[0];
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*entryType*/ 1) {
    				input.checked = input.__value === /*entryType*/ ctx[0];
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[9][0].splice(/*$$binding_groups*/ ctx[9][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(92:10) {#each entryOptions as entry}",
    		ctx
    	});

    	return block;
    }

    // (105:6) {#if entryType === 'Task'}
    function create_if_block_1$1(ctx) {
    	let div;
    	let label;
    	let t1;
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value = /*$projects*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			label.textContent = "Project";
    			t1 = space();
    			select = element("select");
    			option = element("option");
    			option.textContent = "Select a project\n            ";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(label, "class", "uk-flex-none uk-flex-nowrap uk-margin-small-right\n            uk-text-bold uk-width-1-4");
    			add_location(label, file$3, 106, 10, 2914);
    			option.__value = "Select a project";
    			option.value = option.__value;
    			option.selected = true;
    			option.disabled = true;
    			add_location(option, file$3, 112, 12, 3162);
    			attr_dev(select, "id", "entryProject");
    			attr_dev(select, "class", "uk-select");
    			if (/*entryProject*/ ctx[2] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[10].call(select));
    			add_location(select, file$3, 111, 10, 3079);
    			attr_dev(div, "class", "uk-flex uk-flex-middle uk-margin-top");
    			add_location(div, file$3, 105, 8, 2853);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(div, t1);
    			append_dev(div, select);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*entryProject*/ ctx[2]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[10]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects*/ 8) {
    				each_value = /*$projects*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*entryProject, $projects*/ 12) {
    				select_option(select, /*entryProject*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(105:6) {#if entryType === 'Task'}",
    		ctx
    	});

    	return block;
    }

    // (116:12) {#each $projects as project}
    function create_each_block$2(ctx) {
    	let option;
    	let t_value = /*project*/ ctx[13].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*project*/ ctx[13].name;
    			option.value = option.__value;
    			add_location(option, file$3, 116, 14, 3322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$projects*/ 8 && t_value !== (t_value = /*project*/ ctx[13].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$projects*/ 8 && option_value_value !== (option_value_value = /*project*/ ctx[13].name)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(116:12) {#each $projects as project}",
    		ctx
    	});

    	return block;
    }

    // (122:6) {#if entryType !== undefined}
    function create_if_block$3(ctx) {
    	let div;
    	let label;
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			label = element("label");
    			t0 = text(/*entryType*/ ctx[0]);
    			t1 = text(" Name");
    			t2 = space();
    			input = element("input");
    			attr_dev(label, "class", "uk-flex-none uk-flex-nowrap uk-margin-small-right\n            uk-text-bold uk-width-1-4");
    			add_location(label, file$3, 123, 10, 3547);
    			attr_dev(input, "id", "entryName");
    			attr_dev(input, "class", "uk-input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Enter a value");
    			add_location(input, file$3, 128, 10, 3721);
    			attr_dev(div, "class", "uk-flex uk-flex-middle uk-margin-top");
    			add_location(div, file$3, 122, 8, 3486);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, label);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(div, t2);
    			append_dev(div, input);
    			set_input_value(input, /*entryName*/ ctx[1]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[11]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*entryType*/ 1) set_data_dev(t0, /*entryType*/ ctx[0]);

    			if (dirty & /*entryName*/ 2 && input.value !== /*entryName*/ ctx[1]) {
    				set_input_value(input, /*entryName*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(122:6) {#if entryType !== undefined}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let h2;
    	let t0;
    	let p;
    	let t2;
    	let div3;
    	let div2;
    	let label;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let t7;
    	let div4;
    	let button0;
    	let t9;
    	let button1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*entryOptions*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block0 = /*entryType*/ ctx[0] === "Task" && create_if_block_1$1(ctx);
    	let if_block1 = /*entryType*/ ctx[0] !== undefined && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text("Add Stuff\n        ");
    			p = element("p");
    			p.textContent = "Use this form to add a new project or task";
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			label = element("label");
    			label.textContent = "Entry Type";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block0) if_block0.c();
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Cancel";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Add";
    			attr_dev(p, "class", "uk-text-meta uk-margin-remove");
    			add_location(p, file$3, 78, 8, 2042);
    			attr_dev(h2, "class", "uk-modal-title");
    			add_location(h2, file$3, 76, 6, 1988);
    			attr_dev(div0, "class", "uk-modal-header");
    			add_location(div0, file$3, 75, 4, 1952);
    			attr_dev(label, "class", "uk-flex-none uk-flex-nowrap uk-margin-small-right uk-text-bold\n          uk-width-1-4");
    			add_location(label, file$3, 85, 8, 2256);
    			attr_dev(div1, "class", "uk-form-controls");
    			add_location(div1, file$3, 90, 8, 2414);
    			attr_dev(div2, "class", "uk-flex uk-flex-middle");
    			add_location(div2, file$3, 84, 6, 2211);
    			attr_dev(div3, "class", "uk-modal-body");
    			add_location(div3, file$3, 83, 4, 2177);
    			attr_dev(button0, "class", "uk-button uk-button-default uk-modal-close");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$3, 138, 6, 3978);
    			attr_dev(button1, "class", "uk-button uk-button-primary");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$3, 144, 6, 4130);
    			attr_dev(div4, "class", "uk-modal-footer uk-text-right");
    			add_location(div4, file$3, 137, 4, 3928);
    			attr_dev(div5, "class", "uk-modal-dialog uk-margin-auto-vertical");
    			add_location(div5, file$3, 74, 2, 1894);
    			attr_dev(div6, "id", "entryModal");
    			attr_dev(div6, "uk-modal", "");
    			add_location(div6, file$3, 73, 0, 1837);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, p);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, label);
    			append_dev(div2, t4);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div3, t5);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div3, t6);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t9);
    			append_dev(div4, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*reset*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*makeEntry*/ ctx[6], false, false, false),
    					listen_dev(div6, "shown", /*modalVisible*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*entryOptions, entryType*/ 17) {
    				each_value_1 = /*entryOptions*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*entryType*/ ctx[0] === "Task") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div3, t6);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*entryType*/ ctx[0] !== undefined) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$3(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks, detaching);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $projects;
    	let $tasks;
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(3, $projects = $$value));
    	validate_store(tasks, "tasks");
    	component_subscribe($$self, tasks, $$value => $$invalidate(12, $tasks = $$value));
    	let entryOptions = ["Project", "Task"];
    	let entryType, entryName, entryProject;

    	function modalVisible() {
    		document.addEventListener("keyup", function submitOnEnter(e) {
    			if (e.keyCode === 13) {
    				makeEntry();
    				document.removeEventListener("keyup", submitOnEnter);
    			}
    		});
    	}

    	function makeEntry() {
    		if (entryType === "Project") {
    			set_store_value(projects, $projects = [
    				...$projects,
    				{
    					name: entryName,
    					taskCount: 0,
    					dateCreated: Date.now(),
    					dateModified: Date.now()
    				}
    			]);
    		}

    		if (entryType === "Task") {
    			$projects.filter(project => project.name === entryProject)[0].taskCount++;
    			set_store_value(projects, $projects = [...$projects]);

    			set_store_value(tasks, $tasks = [
    				...$tasks,
    				{
    					id: Date.now(),
    					name: entryName,
    					project: entryProject,
    					dateCreated: Date.now(),
    					dateModified: Date.now()
    				}
    			]);
    		}

    		UIkit.notification(`<div class='uk-text-center'><span uk-icon='icon: ${entryType === "Project" ? "folder" : "check"}'></span> ${entryType} Added</div>`, {
    			status: "primary",
    			pos: "bottom-center",
    			timeout: 1500
    		});

    		UIkit.modal("#entryModal").hide();
    		return reset();
    	}

    	function reset() {
    		const context = document.querySelector("div#entryModal");
    		const inputs = context.querySelectorAll("input");

    		inputs.forEach(input => {
    			if (input.type === "text") {
    				input.value = "";
    			}

    			if (input.type === "radio") {
    				input.checked = false;
    			}

    			if (input.type === "select") {
    				input.value = "Select a project";
    			}

    			$$invalidate(0, entryType = $$invalidate(1, entryName = $$invalidate(2, entryProject = undefined)));
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EntryModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EntryModal", $$slots, []);
    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		entryType = this.__value;
    		$$invalidate(0, entryType);
    	}

    	function select_change_handler() {
    		entryProject = select_value(this);
    		$$invalidate(2, entryProject);
    	}

    	function input_input_handler() {
    		entryName = this.value;
    		$$invalidate(1, entryName);
    	}

    	$$self.$capture_state = () => ({
    		active,
    		projects,
    		tasks,
    		entryOptions,
    		entryType,
    		entryName,
    		entryProject,
    		modalVisible,
    		makeEntry,
    		reset,
    		$projects,
    		$tasks
    	});

    	$$self.$inject_state = $$props => {
    		if ("entryOptions" in $$props) $$invalidate(4, entryOptions = $$props.entryOptions);
    		if ("entryType" in $$props) $$invalidate(0, entryType = $$props.entryType);
    		if ("entryName" in $$props) $$invalidate(1, entryName = $$props.entryName);
    		if ("entryProject" in $$props) $$invalidate(2, entryProject = $$props.entryProject);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entryType,
    		entryName,
    		entryProject,
    		$projects,
    		entryOptions,
    		modalVisible,
    		makeEntry,
    		reset,
    		input_change_handler,
    		$$binding_groups,
    		select_change_handler,
    		input_input_handler
    	];
    }

    class EntryModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EntryModal",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Components/ProjectModal.svelte generated by Svelte v3.24.0 */
    const file$4 = "src/Components/ProjectModal.svelte";

    function create_fragment$4(ctx) {
    	let div6;
    	let div5;
    	let div0;
    	let h2;
    	let t0;
    	let p;
    	let t2;
    	let div2;
    	let div1;
    	let label;
    	let t4;
    	let input;
    	let t5;
    	let div4;
    	let button0;
    	let t7;
    	let div3;
    	let button1;
    	let t9;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			h2 = element("h2");
    			t0 = text("Edit Project\n        ");
    			p = element("p");
    			p.textContent = "Use this form to edit the name of a project or delete it";
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			label = element("label");
    			label.textContent = "Project Name";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			div4 = element("div");
    			button0 = element("button");
    			button0.textContent = "Delete";
    			t7 = space();
    			div3 = element("div");
    			button1 = element("button");
    			button1.textContent = "Cancel";
    			t9 = space();
    			button2 = element("button");
    			button2.textContent = "Update";
    			attr_dev(p, "class", "uk-text-meta uk-margin-remove");
    			add_location(p, file$4, 88, 8, 2715);
    			attr_dev(h2, "class", "uk-modal-title");
    			add_location(h2, file$4, 86, 6, 2658);
    			attr_dev(div0, "class", "uk-modal-header");
    			add_location(div0, file$4, 85, 4, 2622);
    			attr_dev(label, "class", "uk-flex-none uk-flex-nowrap uk-margin-small-right uk-text-bold");
    			add_location(label, file$4, 95, 8, 2943);
    			attr_dev(input, "class", "uk-input");
    			attr_dev(input, "type", "text");
    			add_location(input, file$4, 99, 8, 3080);
    			attr_dev(div1, "class", "uk-flex uk-flex-middle");
    			add_location(div1, file$4, 94, 6, 2898);
    			attr_dev(div2, "class", "uk-modal-body");
    			add_location(div2, file$4, 93, 4, 2864);
    			attr_dev(button0, "class", "uk-button uk-button-danger");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$4, 103, 6, 3239);
    			attr_dev(button1, "class", "uk-button uk-button-default uk-modal-close");
    			attr_dev(button1, "type", "button");
    			add_location(button1, file$4, 110, 8, 3397);
    			attr_dev(button2, "class", "uk-button uk-button-primary");
    			attr_dev(button2, "type", "button");
    			add_location(button2, file$4, 116, 8, 3561);
    			add_location(div3, file$4, 109, 6, 3383);
    			attr_dev(div4, "class", "uk-modal-footer uk-flex uk-flex-between");
    			add_location(div4, file$4, 102, 4, 3179);
    			attr_dev(div5, "class", "uk-modal-dialog uk-margin-auto-vertical");
    			add_location(div5, file$4, 84, 2, 2564);
    			attr_dev(div6, "id", "projectModal");
    			attr_dev(div6, "uk-modal", "");
    			add_location(div6, file$4, 83, 0, 2505);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, h2);
    			append_dev(h2, t0);
    			append_dev(h2, p);
    			append_dev(div5, t2);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(div1, t4);
    			append_dev(div1, input);
    			set_input_value(input, /*updatedProjectName*/ ctx[0]);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(div4, t7);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(div3, t9);
    			append_dev(div3, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(button0, "click", /*deleteProject*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*reset*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*updateProject*/ ctx[2], false, false, false),
    					listen_dev(div6, "shown", /*modalVisible*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*updatedProjectName*/ 1 && input.value !== /*updatedProjectName*/ ctx[0]) {
    				set_input_value(input, /*updatedProjectName*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $active;
    	let $projects;
    	let $tasks;
    	validate_store(active, "active");
    	component_subscribe($$self, active, $$value => $$invalidate(6, $active = $$value));
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(7, $projects = $$value));
    	validate_store(tasks, "tasks");
    	component_subscribe($$self, tasks, $$value => $$invalidate(8, $tasks = $$value));

    	function modalVisible() {
    		document.addEventListener("keyup", function updateOnEnter(e) {
    			if (e.keyCode === 13) {
    				updateProject();
    				document.removeEventListener("keyup", updateOnEnter);
    			}
    		});
    	}

    	function updateProject() {
    		const existingAttributes = $projects.filter(project => project.name === $active);
    		const refId = $projects.findIndex(obj => obj.name === $active);

    		$projects.splice(refId, 1, {
    			name: updatedProjectName,
    			taskCount: existingAttributes[0].taskCount,
    			dateCreated: existingAttributes[0].dateCreated,
    			dateModified: Date.now()
    		});

    		set_store_value(active, $active = updatedProjectName);
    		set_store_value(projects, $projects = [...$projects]);
    		UIkit.modal("#projectModal").hide();

    		UIkit.notification("<div class='uk-text-center'><span uk-icon='icon: folder'></span> Project Updated</div>", {
    			status: "primary",
    			pos: "bottom-center",
    			timeout: 1500
    		});

    		return reset();
    	}

    	function deleteProject() {
    		UIkit.modal.confirm(`<h1 class='uk-heading-small'>Delete Project</h1>Are you sure that you would like to delete <b>${$active}</b> and all the associated tasks?<br/><br/><em>Note: This cannot be undone.</em>`).then(
    			() => {
    				const refId = $projects.findIndex(obj => obj.name === $active);
    				$projects.splice(refId, 1);
    				set_store_value(projects, $projects = [...$projects]);

    				$tasks.filter(task => task.project === $active).forEach(task => {
    					const refId = $tasks.findIndex(obj => obj.id === task.id);
    					$tasks.splice(refId, 1);
    				});

    				set_store_value(tasks, $tasks = [...$tasks]);
    				set_store_value(active, $active = "All Tasks");
    				UIkit.modal("#projectModal").hide();

    				UIkit.notification("<div class='uk-text-center'><span uk-icon='icon: close'></span> Project Deleted</div>", {
    					status: "danger",
    					pos: "bottom-center",
    					timeout: 1500
    				});

    				return reset();
    			},
    			() => {
    				return false;
    			}
    		);
    	}

    	function reset() {
    		const context = document.querySelector("#projectModal");
    		const input = context.querySelector("input");
    		return input.value = $active;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ProjectModal> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ProjectModal", $$slots, []);

    	function input_input_handler() {
    		updatedProjectName = this.value;
    		($$invalidate(0, updatedProjectName), $$invalidate(6, $active));
    	}

    	$$self.$capture_state = () => ({
    		active,
    		projects,
    		tasks,
    		modalVisible,
    		updateProject,
    		deleteProject,
    		reset,
    		updatedProjectName,
    		$active,
    		$projects,
    		$tasks
    	});

    	$$self.$inject_state = $$props => {
    		if ("updatedProjectName" in $$props) $$invalidate(0, updatedProjectName = $$props.updatedProjectName);
    	};

    	let updatedProjectName;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$active*/ 64) {
    			 $$invalidate(0, updatedProjectName = $active);
    		}
    	};

    	return [
    		updatedProjectName,
    		modalVisible,
    		updateProject,
    		deleteProject,
    		reset,
    		input_input_handler
    	];
    }

    class ProjectModal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectModal",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.24.0 */
    const file$5 = "src/App.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let div1;
    	let div0;
    	let h1;
    	let span;
    	let t0;
    	let t1;
    	let div2;
    	let ul;
    	let li;
    	let a;
    	let t3;
    	let div3;
    	let list;
    	let t4;
    	let stats_1;
    	let t5;
    	let entrymodal;
    	let t6;
    	let projectmodal;
    	let current;
    	list = new List({ $$inline: true });
    	stats_1 = new Stats({ $$inline: true });
    	entrymodal = new EntryModal({ $$inline: true });
    	projectmodal = new ProjectModal({ $$inline: true });

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			span = element("span");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div2 = element("div");
    			ul = element("ul");
    			li = element("li");
    			a = element("a");
    			a.textContent = "Stats";
    			t3 = space();
    			div3 = element("div");
    			create_component(list.$$.fragment);
    			t4 = space();
    			create_component(stats_1.$$.fragment);
    			t5 = space();
    			create_component(entrymodal.$$.fragment);
    			t6 = space();
    			create_component(projectmodal.$$.fragment);
    			add_location(span, file$5, 138, 8, 3940);
    			attr_dev(h1, "class", "uk-heading uk-margin-remove svelte-oqb1ux");
    			add_location(h1, file$5, 137, 6, 3891);
    			attr_dev(div0, "class", "uk-navbar-item");
    			add_location(div0, file$5, 136, 4, 3856);
    			attr_dev(div1, "class", "uk-navbar-left");
    			add_location(div1, file$5, 135, 2, 3823);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "uk-toggle", "target: #nerdStats");
    			add_location(a, file$5, 145, 8, 4074);
    			add_location(li, file$5, 144, 6, 4061);
    			attr_dev(ul, "class", "uk-navbar-nav");
    			add_location(ul, file$5, 143, 4, 4028);
    			attr_dev(div2, "class", "uk-navbar-right");
    			add_location(div2, file$5, 142, 2, 3994);
    			attr_dev(nav, "class", "uk-navbar-container uk-light svelte-oqb1ux");
    			attr_dev(nav, "uk-navbar", "");
    			add_location(nav, file$5, 134, 0, 3768);
    			attr_dev(div3, "class", "uk-container");
    			add_location(div3, file$5, 150, 0, 4165);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, span);
    			append_dev(span, t0);
    			append_dev(nav, t1);
    			append_dev(nav, div2);
    			append_dev(div2, ul);
    			append_dev(ul, li);
    			append_dev(li, a);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(list, div3, null);
    			insert_dev(target, t4, anchor);
    			mount_component(stats_1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(entrymodal, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(projectmodal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(list.$$.fragment, local);
    			transition_in(stats_1.$$.fragment, local);
    			transition_in(entrymodal.$$.fragment, local);
    			transition_in(projectmodal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(list.$$.fragment, local);
    			transition_out(stats_1.$$.fragment, local);
    			transition_out(entrymodal.$$.fragment, local);
    			transition_out(projectmodal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div3);
    			destroy_component(list);
    			if (detaching) detach_dev(t4);
    			destroy_component(stats_1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(entrymodal, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(projectmodal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $tasks;
    	let $projects;
    	let $stats;
    	validate_store(tasks, "tasks");
    	component_subscribe($$self, tasks, $$value => $$invalidate(2, $tasks = $$value));
    	validate_store(projects, "projects");
    	component_subscribe($$self, projects, $$value => $$invalidate(3, $projects = $$value));
    	validate_store(stats, "stats");
    	component_subscribe($$self, stats, $$value => $$invalidate(4, $stats = $$value));
    	let { name } = $$props;
    	stats.useLocalStorage();
    	let storageUsed = null;

    	function oldestTask() {
    		let largestDifference = 0;
    		let oldest;

    		$tasks.forEach(task => {
    			const difference = Date.now() - task.dateCreated;

    			if (difference > largestDifference) {
    				largestDifference = difference;
    				oldest = task.name;
    			}
    		});

    		return largestDifference / (1000 * 60 * 60) >= 1
    		? `${oldest}<br/><br/><div class="uk-text-success">${(largestDifference / (1000 * 60 * 60)).toFixed(0)} hours</div>`
    		: `${oldest}<br/><br/><div class="uk-text-success">${(largestDifference / (1000 * 60 * 60)).toFixed(0)} hour</div>`;
    	}

    	function oldestProject() {
    		let largestDifference = 0;
    		let oldest;

    		$projects.forEach(project => {
    			const difference = Date.now() - project.dateCreated;

    			if (difference > largestDifference) {
    				largestDifference = difference;
    				oldest = project.name;
    			}
    		});

    		return largestDifference / (1000 * 60 * 60) >= 1
    		? `${oldest}<br/><br/><div class="uk-text-success">${(largestDifference / (1000 * 60 * 60)).toFixed(0)} hours</div>`
    		: `${oldest}<br/><br/><div class="uk-text-success">${(largestDifference / (1000 * 60 * 60)).toFixed(0)} hour</div>`;
    	}

    	function favoriteProject() {
    		let greatestTaskCount = 0;
    		let favorite;

    		$projects.forEach(project => {
    			if (project.taskCount > greatestTaskCount) {
    				greatestTaskCount = project.taskCount;
    				favorite = project.name;
    			}
    		});

    		return `${favorite}<br/><br/><div class="uk-text-success">(Task Count: ${greatestTaskCount})</div>`;
    	}

    	function longestString() {
    		let stringLength = 0;
    		let longest;

    		$tasks.forEach(task => {
    			if (task.name.length > stringLength) {
    				stringLength = task.name.length;
    				longest = task.name;
    			}
    		});

    		return `${longest}<br/><br/><div class="uk-text-success">(Characters: ${stringLength})</div>`;
    	}

    	navigator.storage.estimate().then(({ usage, quota }) => {
    		storageUsed = `${(usage / quota * 100).toFixed(2)}%`;
    		set_store_value(stats, $stats = [...$stats]);
    	});

    	function updateStats() {
    		return set_store_value(stats, $stats = [
    			{
    				name: "Storage Usage",
    				value: storageUsed !== null
    				? storageUsed
    				: "Calculating<div class='uk-margin-small-left' uk-spinner='ratio: 0.5'/>"
    			},
    			{
    				name: "Last Visit",
    				value: $stats.filter(stat => stat.name === "Last Visit").length > 0
    				? Date($stats.filter(stat => stat.name === "Last Visit")[0].value).toLocaleString()
    				: "No Date"
    			},
    			{
    				name: "Longest String",
    				value: longestString()
    			},
    			{
    				name: "Favorite Project",
    				value: favoriteProject()
    			},
    			{
    				name: "Oldest Project",
    				value: oldestProject()
    			},
    			{ name: "Oldest Task", value: oldestTask() }
    		]);
    	}

    	onMount(() => {
    		updateStats();
    	});

    	beforeUpdate(() => {
    		updateStats();
    	});

    	window.onunload = () => {
    		$stats.filter(stat => stat.name === "Last Visit")[0].value = Date.now();
    	};

    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		name,
    		stats,
    		tasks,
    		projects,
    		onMount,
    		beforeUpdate,
    		Stats,
    		List,
    		EntryModal,
    		ProjectModal,
    		storageUsed,
    		oldestTask,
    		oldestProject,
    		favoriteProject,
    		longestString,
    		updateStats,
    		$tasks,
    		$projects,
    		$stats
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("storageUsed" in $$props) storageUsed = $$props.storageUsed;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "Tasks",
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
