export function getUrlVars() {
  if (!window || !process.browser) {
    throw new Error('Cant get url vars when not rendering');
  }
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}