import {DATA_ORIGIN, DATA_PARSEDATE, DATA_STUDENTS} from './data/students.js'
import {THEMES} from './data/themes.js'
import {DATA_ABOUT} from './data/about.js'
import {DATA_EXCLUDE_PROJECTLINK} from './data/excludes.js'


function compare( a, b ) {
  if ( a.name < b.name ){
    return -1;
  }
  if ( a.name > b.name ){
    return 1;
  }
  return 0;
}

DATA_STUDENTS.sort( compare );

export {
  DATA_ORIGIN,
  DATA_PARSEDATE,
  DATA_STUDENTS,
  DATA_ABOUT,
  DATA_EXCLUDE_PROJECTLINK,
  THEMES
}