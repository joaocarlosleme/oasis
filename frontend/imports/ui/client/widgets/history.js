import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';

import TokenEvents from '/imports/api/tokenEvents';
import { txHref } from '/imports/utils/functions';

import './history.html';

//let historyResult = null;

Template.history.viewmodel({
  autorun() {
    if (this.historyType() === 'depositHistory') {
      Session.set('loadingWrapHistory', true);
    }
    if (this.historyType() === 'transferHistory') {
      Session.set('loadingTransferHistory', true);
    }
  },
  currencyClass(token) {
    return token === Session.get('quoteCurrency') ? 'quote-currency' : 'base-currency';
  },
  historyCount() { // **** removed to optimize code: added historyCount to Session and placed it on history() because its unnecessary....it runs history all over again just to get count.
    return Session.get('historyCount') || this.history().count();
  },
  history() {
    const address = Session.get('address');
    const historyResult = TokenEvents.find({
      type: { $in: ['deposit', 'withdrawal'] },
      $or: [{ to: address }, { from: address }],
    }, { sort: { blockNumber: -1 } });
    Session.set('historyCount', historyResult.count());
    TokenEvents.syncTimestamps(); // (JON) added by John to fix date sync on local blockchain (when latestblock is not updated regularty)
    return historyResult;
  },
  transferHistory() {
    const address = Session.get('address');
    return TokenEvents.find({
      type: { $in: ['transfer'] },
      $or: [{ to: address }, { from: address }], //this triggers reactiveness when the user switches between addresses
    }, { sort: { blockNumber: -1 } });
  },
  transferHistoryCount() {
    return this.transferHistory().count();
  },
});

Template.history.events({
  'click tr.clickable': function offer(event) {
    event.preventDefault();
    if (this.transactionHash) {
      window.open(txHref(this.transactionHash), '_blank');
    }
  },
});
