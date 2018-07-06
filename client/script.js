const formToJSON = elements => [].reduce.call(elements, (data, element) => {
  data[element.name] = element.value;
  return data;
}, {});

const handleFormSubmit = event => {
  event.preventDefault();
  const data = formToJSON(form.elements);
  console.log(data);
  fetch('/createuser', {
      method: 'post',
      headers: {
        'Accept': 'application/json, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(console.log('done'));
};

const form = document.getElementById('userinput');
form.addEventListener('submit', handleFormSubmit);