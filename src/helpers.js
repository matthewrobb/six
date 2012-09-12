exports.extend = (object, properties) => {
  var key, val
  for (key in properties) {
    val = properties[key]
    object[key] = val
  }
  return object
}