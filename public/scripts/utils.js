function openModal() {
    document.getElementById('todoModal').style.display = 'block';

}

function closeModal() {
    document.getElementById('todoModal').style.display = 'none';
    document.getElementById('todoname').value = '';
    document.getElementById('tododescription').value = '';
    document.getElementById('priority').value = 1;
}

async function openIPModal() {
    try {
        const response = await fetch('/iplist');
        data = await response.json()

        let ul = document.getElementById('listOfDest')
        ul.innerHTML = ""
        data.forEach(id => {
            const button = document.createElement('button');
            button.textContent = `${id}`;
            button.id = "modalButtons"
            const li = document.createElement('li');
            button.onclick = function () {
                window.open(`http://${id}:11030/`, '_blank');
            };
            li.append(button);
            ul.append(li)
            ul.append(document.createElement('br'))
        })

    } catch (error) {
        console.error('Error fetching data:', error);
    }
    document.getElementById('ipModal').style.display = 'block';

}


document.getElementById('ip-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission to allow custom handling
    const formData = new FormData(this); // Collect form data
    const formJSON = {};
    formData.forEach((value, key) => {
        formJSON[key] = value;
    });

    fetch('./iplist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formJSON)
    })
        .then(response => { }) // Parse JSON response
        .then(data => {
            console.log('Success:', data);
            closeIPModal(); // Close the modal on success
            // fetchDataAndDisplay();
            openIPModal();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

function closeIPModal() {
    document.getElementById('ipModal').style.display = 'none';
    document.getElementById('ip').value = '';
}


document.getElementById('todo-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form submission to allow custom handling
    const formData = new FormData(this); // Collect form data
    const creationTime = new Date().toISOString(); // Add creation time
    formData.append('Creation Time', creationTime);

    const formJSON = {};
    formData.forEach((value, key) => {
        formJSON[key] = value;
    });

    fetch('./create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formJSON)
    })
        .then(response => { }) // Parse JSON response
        .then(data => {
            console.log('Success:', data);
            closeModal(); // Close the modal on success
            fetchDataAndDisplay();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});

async function fetchDataAndDisplay() {
    try {
        const response = await fetch('./data');
        const data = await response.json(); // Assuming data is in array-of-arrays format

        const highPriority = [];
        const mediumPriority = [];
        const lowPriority = [];

        data.forEach(item => {
            if (item[5] == 3) {
                highPriority.push([item[0], item[1]]); // Assuming each item has a name and priority
            } else if (item[5] == 2) {
                mediumPriority.push([item[0], item[1]]);
            } else if (item[5] == 1) {
                lowPriority.push([item[0], item[1]]);
            }
        });

        renderList('highPriorityList', highPriority);
        renderList('mediumPriorityList', mediumPriority);
        renderList('lowPriorityList', lowPriority);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function renderList(elementId, items) {
    const ulElement = document.getElementById(elementId);
    ulElement.innerHTML = '';

    items.forEach(item => {
        const li = document.createElement('li');
        const textButton = document.createElement('button');
        textButton.textContent = item[1];
        const button = document.createElement('button');
        button.textContent = 'Complete';
        button.onclick = function () {
            fetch(`/complete/${item[0]}`, { method: 'POST' })
                .then(response => {
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        alert('Failed to complete the task.');
                    }
                });
        };
        textButton.onclick = function () {
            fetch(`/information/${item[0]}`)
                .then(response => response.json())
                .then(data => {
                    let newData = data
                    message = `\tTitle : ${newData[1]}\n`
                    if (newData[2].length > 0)
                        message += `\tDescription : ${newData[2]}\n`
                    message += `\tCreated Date and Time : ${newData[3]}\n`
                    message += `\tCompleted : ${newData[4]}\n`
                    diff = parseInt(data[5])
                    if (diff == 1)
                        diff = "Low"
                    else if (diff == 2)
                        diff = "Medium"
                    else if (diff == 3)
                        diff = "High"
                    message += `\tPriority : ${diff}\n`
                    alert(`Information:\n${message}`);
                })
                .catch(error => {
                    alert('Error fetching information.');
                });
        };
        li.appendChild(textButton);
        li.appendChild(button);
        ulElement.appendChild(li);
    });
}

window.onload = fetchDataAndDisplay;