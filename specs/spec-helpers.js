export function classes (classesString) {
  let classes = classesString || '';
  if (typeof classes === 'object') {
    classes = classes.baseVal;
  }
  classes = classes.replace(/\s/g, ' ');
  return classes.split(' ');
}