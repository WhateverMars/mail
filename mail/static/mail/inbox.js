document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  console.log('compose mode')

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // enable send button
  document.querySelector('#compose-form').addEventListener('submit', (event) => {
    event.preventDefault()
    send_mail();
    load_mailbox('sent');
  });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // list emails
  fetch('/emails/inbox')
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach(element => {
      var emailEntry = document.createElement('div');
      emailEntry.innerHTML = `<div style="display: flex; justify-content: space-between; gap:18px" ><div style="font-weight:900;">${element.sender}</div><div class = "subject">${element.subject}</div></div><div style ="color: grey;">${element.timestamp}</div>`;
      emailEntry.style.border = '2px solid black'
      emailEntry.style.marginBottom = '8px'
      emailEntry.style.padding = '2px'
      emailEntry.style.display = 'flex'
      emailEntry.style.justifyContent = 'space-between'
      emailEntry.addEventListener('click', () => view_email(element.id))
      document.querySelector('#emails-view').appendChild(emailEntry);
      
    });
    
  });

}

function view_email(id){
  var string = '/emails/'+id
  console.log({string})
  fetch(string, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
  fetch(string)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    // ... do something else with email ...
});

  
}

function send_mail() {
  console.log('This means the fn is started');
  console.log(document.querySelector('#compose-recipients').value);
  
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });
}