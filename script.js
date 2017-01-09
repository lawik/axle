var pointer = 1;

var idle_container = document.getElementById('idle-container');
var all_container = document.getElementById('all-container');
var action_form = document.getElementById('action-form');
var action_actor = null;

// vill contain a key for every slot that contains an action
var timeline_calculated = {};

var actors_available = {};

var action_types = [
    'wait',
    'chargeup',
    'attack',
    'defend'
];

var actors = {
    'Kr': {
        name: 'Kragah',
        id: 'Kr'
    },
    'Hi': {
        name: 'Hildegard',
        id: 'Hi'
    }
};

// var actors = {
//     'Kr': {
//         name: 'Kragah',
//         id: 'Kr'
//     },
//     'Hi': {
//         name: 'Hildegard',
//         id: 'Hi'
//     },
//     'Ni': {
//         name: 'Nico',
//         id: 'Ni'
//     }
// };

var timeline = { // key is position on timeline
    1: [
        {
            actor: 'Kr',
            type: 'defend',
            duration: 3
        }
    ],
    4: [
        {
            actor: 'Kr',
            type: 'wait',
            duration: 4
        }
    ],
    8: [
        {
            actor: 'Kr',
            type: 'chargeup',
            duration: 4
        }
    ],
    12: [
        {
            actor: 'Kr',
            type: 'attack',
            duration: 1
        }
    ],
    5: [
        {
            actor: 'Hi',
            type: 'chargeup',
            duration: 7
        }
    ],
    10: [
        {
            actor: 'Hi',
            type: 'attack',
            duration: 1
        }
    ]
};

var stops = {};

document.body.addEventListener('click', function (event) {
    var element = event.target;
    if(element.classList.contains('slot')) {
        // console.log("slot click...");
        // var actor = document.createElement('div');
        // actor.classList.add('actor');
        // actor.textContent = 'Ac';
        // element.appendChild(actor);
        // return false;
    }
});

function add_actor_action (event) {
    var element = event.target;
    if(element.classList.contains('actor')) {
        var actor_key = element.getAttribute('data-key');
        var actor = actors[actor_key];
        update_action_form();
        show_action_form(actor.name);
        action_actor = actor;
    }
}

idle_container.addEventListener('click', add_actor_action);
all_container.addEventListener('click', add_actor_action);

function play() {
    var go = true;
    console.log(pointer);
    var start_pointer = pointer;
    while(go) {
        pointer++;
        update(pointer);
        // check if there are any actors registered that have no actions, if so, stop
        // check if there is an action start or action end, if so stop
        var has_actors_available = false;
        for(var i in actors_available) {
            has_actors_available = true;
            break;
        }

        if(has_actors_available) {
            go = false;
            break;
        }

        var slot_key = pointer.toString();
        if(stops[slot_key] !== undefined) {
            go = false;
            break;
        }

        if(Object.keys(stops).length == 0) {
            go = false;
            break;
        }

        // if(go) {
        //     go = false;
        //     console.log("debug-thing");
        //     break;
        // }
        // updates actors_available

        if(start_pointer+25 < pointer) {
            go = false;
            console.log("Stopping after 25 regardless.");
            break;
        }

        update(pointer);
    }
    update(pointer);
}

function show_action_form(name) {
    action_form.classList.add('visible');
    var element = document.getElementById('action-label')
    element.textContent = 'Action: '+name;
}

function create_action() {
    hide_action_form();
    var offset = parseInt(document.getElementById('action-offset').value, 10);
    var duration = parseInt(document.getElementById('action-blocks').value, 10);
    var type = document.getElementById('action-type').value;
    add_action(action_actor.id, type, pointer+offset, duration);
}

function add_action(actor_id, type, start, duration) {
    if(timeline[start] === undefined) {
        timeline[start] = [];
    }

    timeline[start].push({
        actor: actor_id,
        type: type,
        duration: duration
    });
    update(pointer);
}

function hide_action_form() {
    action_form.classList.remove('visible');
}

function update_action_form () {
    action_type_selector = document.getElementById('action-type');
    action_type_selector.innerHTML = '';
    for(var i in action_types) {
        var option = document.createElement('option');
        option.setAttribute('value', action_types[i]);
        option.textContent = action_types[i];
        action_type_selector.appendChild(option);
    }
}

function update (start) {
    console.log("Update:", start);
    stops = {};
    var timeline_element = document.getElementById('timeline');
    timeline_element.innerHTML = '';
    var length = start+50;

    var actors_used = {};

    var lowest = start;
    var highest = length;
    timeline_calculated = {};

    var drop_keys = [];
    for(var slot_string in timeline) {
        var actions = timeline[slot_string];
        for(var i in actions) {
            var action = actions[i];
            var slot = parseInt(slot_string, 10);
            if(slot + action.duration-1 < start) {
                drop_keys.push(slot_string);
            }
        }
    }

    for(var i in drop_keys) {
        var slot_string = drop_keys[i];
        if(timeline[slot_string] !== undefined) {
            delete timeline[slot_string];
        }
    }

    for(var slot_string in timeline) {
        var actions = timeline[slot_string];
        var slot = parseInt(slot_string, 10);
        for(var i in actions) {
            var action = actions[i];
            actors_used[action.actor] = true;

            var action_end = slot+action.duration-1;
            if(action_end >= slot) {
                if(action_end > highest) {
                    highest = action_end;
                }

                for(var j = slot; j < slot+action.duration; j++) {
                    var show_label = false;

                    if(j == slot) {
                        show_label = true;
                        stops[slot_string] = true;
                    }
                    if(j == action_end) {
                        show_label = true;
                        stops[action_end.toString()] = true;
                    }
                    // always label maybe?
                    show_label = true;
                    add_timeline_calculated_action(timeline_calculated, j, action, show_label);
                }
            }
        }
    }

    if(start < length) {
        for(var num = start; num < length; num++) {
            var el = document.createElement('span');
            el.classList.add('slot');
            el.textContent = num;
            if(timeline_calculated[num] !== undefined) {
                for(var i in timeline_calculated[num]) {
                    var render = timeline_calculated[num][i];
                    var act = document.createElement('div');
                    act.classList.add('actor', render.type);
                    act.textContent = render.label;
                    el.appendChild(act);
                }
            }
            timeline_element.appendChild(el);
        }
    } else {
        document.write("Numbers got fucked up.");
    }

    actors_available = {};
    for(var i in actors) {
        if(actors_used[i] === undefined) {
            actors_available[i] = true;
        }
    }

    idle_container.innerHTML = '';
    for(var i in actors_available) {
        var actor = actors[i];
        var actor_block = document.createElement('div');
        actor_block.classList.add('actor');
        actor_block.setAttribute('data-key', i);
        actor_block.textContent = actor.name;
        idle_container.appendChild(actor_block);
    }

    all_container.innerHTML = '';
    for(var i in actors) {
        var actor = actors[i];
        var actor_block = document.createElement('div');
        actor_block.classList.add('actor');
        actor_block.setAttribute('data-key', i);
        actor_block.textContent = actor.name;
        all_container.appendChild(actor_block);
    }
}

function add_timeline_calculated_action(timeline_calculated, slot, action, show_label) {
    var label = '-';
    if(show_label) {
        label = action.actor;
    }

    if(timeline_calculated[slot] === undefined) {
        timeline_calculated[slot] = [];
    }

    timeline_calculated[slot].push({
        type: action.type,
        label: label,
        actor: action.actor
    });
}

function create_action_element(label, action) {
    var element = document.createElement('div');
    element.classList.add(action.type);
    element.textContent = label;
    return element;
}

update(1);
update_action_form();
