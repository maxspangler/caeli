const recipientForm = document.getElementById('recipientForm');
const sendNotificationForm = document.getElementById('sendNotificationForm');
const newRecipientInput = document.getElementById('newRecipientInput');
const distroGroupSelector = document.getElementById('distroGroupSelector')
const recipientList = document.getElementById('recipients');
const resultSection = document.getElementById('resultSection');
const recipients = [];
const corporateDistro = [2018742004];
const generalManangerDistro = []
const corpPlusGeneralManagerDistro = [];


function addRecipient(phoneNumber) {
  if(phoneNumber == 'General Managers') {
    recipients.push(generalManangerDistro);
  }
  if(phoneNumber == 'Corporate') {
    recipients.push(corporateDistro)
  }
  if(phoneNumber == 'Corporate + General Managers') {
    recipients.push(corpPlusGeneralManagerDistro);
  }
  recipients.push(phoneNumber);
  const newListItem = document.createElement('li');
  newListItem.innerText = phoneNumber;
  recipientList.appendChild(newListItem);
}



function clearForm(form) {
  form.passcode.value = '';
  form.message.value = '';
}

recipientForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  if (newRecipientInput.value) {
    addRecipient(newRecipientInput.value);
    newRecipientInput.value = '';
  }
  if(distroGroupSelector.value) {
    addRecipient(distroGroupSelector.value)
    distroGroupSelector.value = '';
  }
});

function sendMessages(form) {
  const data = {
    passcode: form.passcode.value,
    message: form.message.value,
    recipients: recipients.join(','),
  };
  clearForm(form);

  fetch('.netlify/functions/send-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      } else {
        if (resp.status === 401) {
          throw new Error('Invalid Passcode');
        } else {
          throw new Error(
            'Unexpected error. Please check the logs for what went wrong.'
          );
        }
      }
    })
    .then((body) => {
      const successCount = body.result.reduce((currentCount, resultItem) => {
        return resultItem.success ? currentCount + 1 : currentCount;
      }, 0);

      resultSection.innerText = `Sent ${successCount} of ${body.result.length} messages. Check logs for details`;
    })
    .catch((err) => {
      resultSection.innerText = err.message;
    });
}

sendNotificationForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  if (recipients.length === 0 && newRecipientInput.value) {
    addRecipient(newRecipientInput.value);
    newRecipientInput.value = '';
  }

  if (recipients.length === 0) {
    resultSection.innerText = 'Please enter at least one phone number';
  } else {
    resultSection.innerText = 'Sending messages. One moment';
    sendMessages(evt.target);
  }
});



