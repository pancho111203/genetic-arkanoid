export function getUrlVars() {
  if (!window || !process.browser) {
    throw new Error('Cant get url vars when not rendering');
  }
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}


export function downloadObjectAsJson(exportObj, exportName) {
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

export function runsOnWorker() {
  if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    return true;
  } else {
    return false;
  }
}
