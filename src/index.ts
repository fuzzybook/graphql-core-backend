import Roles from './core/roles/controllers/RolesClass';
import { getRoles } from './Scripts/getRoles';
import { main } from './server';

process.once('SIGUSR2', function () {
  console.log(`\nBye fom process ${process.pid}\n`);
  process.kill(process.pid, 'SIGUSR2');
});

class ConsoleSpiner {
  counter = 0;
  timer: NodeJS.Timeout;
  constructor() {
    this.counter = 0;
  }

  Turn() {
    this.counter++;
    switch (this.counter % 4) {
      case 0:
        console.log('/');
        break;
      case 1:
        console.log('-');
        break;
      case 2:
        console.log('\\');
        break;
      case 3:
        console.log('|');
        break;
    }
    console.log('\x1b[1D\x1b[2A');
  }

  Run() {
    this.timer = setInterval(() => {
      this.Turn();
    }, 500);
  }

  Stop() {
    clearInterval(this.timer);
  }
}

// don't start if JEST ir running
if (process.env.JEST_WORKER_ID === undefined) {
  const consoleSpinner = new ConsoleSpiner();

  const roles = new Roles(true);
  const notFounded = roles.testRoles();
  if (notFounded) {
    console.log(`\x1b[1;31mRoles: [${notFounded}] not declared!\x1b[0m
    `);
    process.exit();
  }

  getRoles().then(() => {
    consoleSpinner.Run();
    main();
  });
}
