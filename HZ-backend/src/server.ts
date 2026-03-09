const cluster = require('node:cluster');
const os = require('node:os');

const workers = Number(process.env.WEB_CONCURRENCY || os.cpus().length);

const isPrimary =
  cluster.isPrimary !== undefined ? cluster.isPrimary : cluster.isMaster;

if (isPrimary) {
  for (let i = 0; i < workers; i++) cluster.fork();
  cluster.on('exit', () => cluster.fork());
} else {
  import('./main');
}
