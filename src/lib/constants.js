export const linksData = [
  {
    title: 'Home',
    caption: 'Tracker',
    icon: 'add_task',
    link: '/',
  },
  {
    title: 'Chart',
    caption: 'Measure Progress',
    icon: 'article',
    link: '/chart',
  },
  {
    title: 'Graph',
    caption: 'Visualise Progress',
    icon: 'assessment',
    link: '/graph'
  },
  {
    title: 'Stats',
    caption: 'Overview',
    icon: 'article',
    link: '/chart',
  },
  {
    title: 'Journal',
    caption: 'Log your learning',
    icon: 'chrome_reader_mode',
    link: '/journal'
  },
  {
    title: 'Edit',
    caption: 'Forgot to track? Add them here',
    icon: 'edit',
    link: '/edit'
  },
  {
    title: 'Settings',
    caption: 'Change your preferences',
    icon: 'phonelink_setup',
    link: '/settings'
  }
];

export const version = "2.0.0";
export const previousVersion = "1.2.0";

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const debug = {
  log: true,
};

export const randomTest = true;

export const autoInc = {
  now: false,
};

export const autoclear = !debug.log;

JSON.clone = function (obj) {
  if (!obj) throw new Error("JSON.clone parameter value invalid.");
  return JSON.parse(JSON.stringify(obj));
};

export const colors = {
  action: 'orange',
  var: 'grey',
  success: 'limegreen',
  state: 'lightblue',
}