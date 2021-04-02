import { ClientFunction, Selector } from 'testcafe';
import * as nodemailer from 'nodemailer';

fixture('Fler.cz').page('https://www.fler.cz/uzivatel/prihlaseni');

test('Make top', async (t): Promise<number> => {
  // eslint-disable-next-line no-param-reassign
  t.ctx.passed = false;
  console.info(`Started at ${new Date().toISOString()}`);
  console.info('Logging in');
  await t
    .wait(2000)
    .typeText('#ti-username', process.env.USERNAME)
    .typeText('#ti-pwd', process.env.PASSWORD)
    .click('button[name="btnLogin"]')
    .wait(2000);
  console.info('Entering product list');
  await t
    .wait(2000)
    .navigateTo('/moje-zbozi2')
    .wait(2000);

  const randomProductPage = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const pageButtonElements = document.querySelectorAll('#panel-bottom .numerics > a');
    const index = getRandomInt(0, pageButtonElements.length);
    if (index === pageButtonElements.length) {
      return [];
    }
    return [pageButtonElements[index]];
  });
  console.info('Entering random product page');
  await t.click(randomProductPage).wait(2000);
  const unhideProductInlineMenus = ClientFunction(
    (): Promise<void> => {
      return new Promise((resolve): void => {
        document.querySelectorAll('.product').forEach(function(item: Element): void {
          // eslint-disable-next-line no-param-reassign
          item.className += ' inline_edit_on';
        });
        resolve();
      });
    }
  );
  const randomProductItem = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const productElements = document.querySelectorAll('#productlist .product');
    if (productElements.length === 0) {
      return [];
    }
    const index = getRandomInt(0, productElements.length - 1);
    return [productElements[index]];
  });
  console.info('Selecting random product item');
  await unhideProductInlineMenus();
  await t.click(randomProductItem.find('[data-editblock-load="topproduct"]')).wait(1000);

  const topButton = Selector((): Node[] => {
    const topButtons = document.querySelectorAll('.flypanel.visible .edit_block_form button');
    if (topButtons.length === 0) {
      return [];
    }
    return [topButtons[0]];
  });
  console.info('Trying to top');
  const canBeTopped = await topButton.exists;
  if (canBeTopped) {
    console.info('Topping');
    await t.click(topButton).wait(2000);
    console.info('Topped');
    // eslint-disable-next-line no-param-reassign
    t.ctx.passed = true;
    return 0;
  }
  console.info('Missing top button');
  console.info('Parsing waiting time');
  const topTimer = Selector('.flypanel.visible .info.message span');
  const topTimerText = await topTimer.getAttribute('title');
  const matches = topTimerText.match(/(\d{2}:\d{2}:\d{2})/g);
  const timeSegments = matches[0].split(':');
  const seconds =
    (Number(timeSegments[0]) * 60 + Number(timeSegments[1])) * 60 + Number(timeSegments[2]);
  console.log('It is topped', {
    nextTop: timeSegments,
    nextTopSeconds: seconds
  });
  // eslint-disable-next-line no-param-reassign
  t.ctx.passed = true;
  return seconds;
}).after(async t => {
  if (t.ctx.passed) {
    console.log('Everything ok.');
    return true;
  }
  console.log('Failture reported.');
  if (
    !process.env.MAIL_HOST ||
    !process.env.MAIL_PORT ||
    !process.env.MAIL_USER ||
    !process.env.MAIL_PASSWORD ||
    !process.env.MAIL_FROM ||
    !process.env.MAIL_TO
  ) {
    console.info('Mail notifications not set.');
    return false;
  }
  const transporter = nodemailer.createTransport(
    `smtp://${process.env.MAIL_USER}:${process.env.MAIL_PASSWORD}@${process.env.MAIL_HOST}:${process.env.MAIL_PORT}`
  );
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    subject: 'Topping failed',
    text: `Topping failed at ${new Date().toISOString()}`
  });
  console.info('Mail notifications send.');
  return false;
});
