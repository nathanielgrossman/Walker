const formToJSON = elements => [].reduce.call(elements, (data, element) => {

  data[element.name] = element.value;
  return data;

}, {});

const handleFormSubmit = event => {
  event.preventDefault();
  const data = formToJSON(form.elements);
  console.log(data);
};

const form = document.getElementById('userinput');
form.addEventListener('submit', handleFormSubmit);