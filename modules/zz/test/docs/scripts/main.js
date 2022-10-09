function testInsert()
{
  document.getElementById("testInsertPoint").innerHTML="innerHTML replaced";
}

function loadComponents()
{
  components = document.getElementsByClassName('component-ref');
  for (var i = 0; i < components.length; ++i)
  {
    var item = components[i];
    var req = new XMLHttpRequest();
    req.open('GET', item.dataset.src, false);
    req.send();
    item.innerHTML = req.responseText;
  }
}