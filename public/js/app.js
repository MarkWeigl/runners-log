$(document).ready(function(){
  var data;

  $('#login').hide();
  $('#editruns').hide();
  $('#viewruns').hide();
  $('#addruns').hide();
  $('#rundetails').hide();

  $('#start').mousedown(function() {
      $('#splashpage').hide();
    //  $('#login').show();
      $('#viewruns').show();
    });

  function getRuns(){
    $.getJSON("/log",function(results){
      data = results;
      displayRuns(results);
    });
  }

  function displayRuns(data){
    var html = `<table align="center"><thead><tr><th>Date</th><th>Time</th><th>Distance</th><th>Actions</th></tr></thead><tbody>`
    for (var i=0; i < data.length; i++) {
      html += `<tr data-id="${data[i].id}"><td>${data[i].date.slice(0,10)}</td>
        <td>${data[i].time}</td>
        <td>${data[i].distance}</td>
        <td><i class="fa fa-pencil edit"></i>
        <i class="fa fa-times delete"></i>
        <i class="fa fa-info details"></i></td></tr>`;
    }
    html += `</tbody></table><br>`;
    html += `<button id="addruns" class="submitruns">Add Run</button>`;
    $('#viewruns').html(html);
  }
  getRuns();

  $('#addruns').mousedown(function() {
    $('#viewruns').hide();
    $('#addruns').show();
  });

    $('#backtolog').mousedown(function() {
    $('#rundetails').hide();
    $('#viewruns').show();
  });

  $(document).on("click",".details",function(){
    var id = $(this).parent().parent().attr("data-id");
    var record = data.filter(function(element){
      return element.id == id;
    });
    displayDetails(record[0], id);
  });

  $(document).on("click",".delete",function(){
    var id = $(this).parent().parent().attr("data-id");
    deleteRun(id);
  });

  $(document).on("click",".edit",function(){
    var id = $(this).parent().parent().attr("data-id");
    var record = data.filter(function(element){
      return element.id == id;
    });
    $("#recordid").val(id);
    $("#dateofrunx").val(record[0].date.slice(0,10));
    $("#timeofrunx").val(record[0].time);
    $("#distanceofrunx").val(record[0].distance);
    $("#locationofrunx").val(record[0].location);
    $("#weatherrunx").val(record[0].weather);
    $("#moodrunx").val(record[0].mood);
    $("#notesrunx").val(record[0].notes);
    $('#editruns').show();
    $('#viewruns').hide();
  
    // editRuns(record[0], id);
  });


  $('#addruns').submit(function(e){
    e.preventDefault();
    var runObj= {};
    runObj.date=$("#dateofrun").val();
    runObj.time=$("#timeofrun").val();
    runObj.distance=$("#distanceofrun").val();
    runObj.location=$("#locationofrun").val();
    runObj.weather=$("#weatherrun").val();
    runObj.mood=$("#moodrun").val();
    runObj.notes=$("#notesrun").val();
    
    $.ajax({
      url: "/log",
      method: "POST",
      data: JSON.stringify(runObj),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        getRuns();
        console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

 $('#editruns').submit(function(e){
    e.preventDefault();
    var runObj= {};
    runObj.id=$("#recordid").val();
    runObj.date=$("#dateofrunx").val();
    runObj.time=$("#timeofrunx").val();
    runObj.distance=$("#distanceofrunx").val();
    runObj.location=$("#locationofrunx").val();
    runObj.weather=$("#weatherrunx").val();
    runObj.mood=$("#moodrunx").val();
    runObj.notes=$("#notesrunx").val();
    $('#editruns').hide();
    $('#viewruns').show();
    $.ajax({
      url: "/log/"+runObj.id,
      method: "PUT",
      data: JSON.stringify(runObj),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        getRuns();
        console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    });
  });

  function displayDetails(data, id){
    var html = `<table align="center"><thead><tr><th>Date</th><th>Time</th><th>Distance</th><th>Location</th>
                <th>Weather</th><th>Mood</th><th>Notes</th></tr></thead><tbody>`
    
      html += `<tr data-id="${data.id}"><td>${data.date.slice(0,10)}</td>
        <td>${data.time}</td>
        <td>${data.distance}</td>
        <td>${data.location}</td>
        <td>${data.weather}</td>
        <td>${data.mood}</td>
        <td>${data.notes}</td>`;
       
    html += `</tbody></table><br>`;
    html += `<button id="backtolog" class="submitruns">Back to Run Log</button>`;
    $('#rundetails').html(html).show();
    $('#viewruns').hide();
  }

  function deleteRun(id){
    $.ajax({
      url: "/log/"+id,
      method: "DELETE",
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        console.log(data);
      },
      error: function(err) {
        console.log(err);
      }
    })
    getRuns();
  }

 });