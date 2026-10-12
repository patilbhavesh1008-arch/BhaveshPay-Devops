(() => {
 const form=document.getElementById('transfer-form'), message=document.getElementById('form-message'), list=document.getElementById('transaction-list');
 const balanceEl=document.getElementById('balance'), sentTotalEl=document.getElementById('sent-total');
 let balance=24850, sentTotal=4250;
 const format=n=>n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const recipient=document.getElementById('recipient').value.trim(), amount=Number(document.getElementById('amount').value), note=document.getElementById('note').value.trim();
  message.className='form-message';
  if(!recipient||!Number.isFinite(amount)||amount<=0||amount>50000){message.textContent='Enter a valid recipient and an amount between ₹1 and ₹50,000.';message.classList.add('error');return;}
  if(amount>balance){message.textContent='Insufficient demo balance. Try a smaller amount.';message.classList.add('error');return;}
  balance-=amount;sentTotal+=amount;balanceEl.textContent=format(balance);sentTotalEl.textContent='₹'+Math.round(sentTotal).toLocaleString('en-IN');
  const row=document.createElement('div');row.className='transaction';
  const icon=document.createElement('div');icon.className='transaction-icon lavender';icon.textContent='↗';
  const info=document.createElement('div');info.className='transaction-info';
  const name=document.createElement('strong');name.textContent='Transfer to '+recipient;
  const detail=document.createElement('small');detail.textContent=(note||'Demo transfer')+' · Just now';info.append(name,detail);
  const value=document.createElement('div');value.className='transaction-amount debit';value.textContent='− ₹'+Math.round(amount).toLocaleString('en-IN');
  row.append(icon,info,value);list.prepend(row);message.textContent='Demo transfer recorded locally. No money was sent.';form.reset();
 });
})();
