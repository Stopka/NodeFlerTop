import { Selector } from 'testcafe';

fixture('Fler.cz').page('https://www.fler.cz');

test('Make top', async (t): Promise<number> => {
  console.info('Logging in');
  await t
    .wait(2000)
    .click('a[href="/uzivatel/prihlaseni"]')
    .wait(2000)
    .typeText('#tiLoginUsernameModal', process.env.USERNAME)
    .typeText('#tiLoginPwdModal', process.env.PASSWORD)
    .click('#btnLoginModal')
    .wait(2000);
  console.info('Entering goods list');
  await t.click('a[href="/moje-zbozi?start=1"]').wait(2000);

  const randomGoodsPage = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const pageButtonElements = document.querySelectorAll('center table tbody tr td div center a');
    const index = getRandomInt(0, pageButtonElements.length);
    if (index === pageButtonElements.length) {
      return [];
    }
    return [pageButtonElements[index]];
  });
  console.info('Entering random goods page');
  await t.click(randomGoodsPage).wait(2000);
  const randomTopButton = Selector((): Node[] => {
    const getRandomInt = (min: number, max: number): number => {
      const minInt = Math.ceil(min);
      const maxInt = Math.floor(max);
      return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
    };
    const pageButtonElements = document.querySelectorAll('a[title="Topovat"]');
    if (pageButtonElements.length === 0) {
      return [];
    }
    const index = getRandomInt(0, pageButtonElements.length - 1);
    return [pageButtonElements[index]];
  });
  console.info('Trying to top');
  const canBeTopped = await randomTopButton.exists;
  if (canBeTopped) {
    console.info('Topping good');
    await t.click(randomTopButton).wait(2000);
  } else {
    console.info('Missing top button');
  }
  console.info('Parsing waiting time');
  const topTimer = Selector('.mzbozi_bound table tbody tr td center div small');
  const topTimerText = await topTimer.innerText;
  const matches = topTimerText.match(/(\d{2}:\d{2}:\d{2})/g);
  const timeSegments = matches[0].split(':');
  const seconds =
    (Number(timeSegments[0]) * 60 + Number(timeSegments[1])) * 60 + Number(timeSegments[2]);
  console.log('It is topped', {
    nextTop: timeSegments,
    nextTopSeconds: seconds
  });
  return seconds;
});
