<html>
<head>
  <meta charset="UTF-8">
  <title> Neural network </title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="images/logo_transparent.png">
  <script type="text/javascript" src="script.js"></script>
</head>
<body>



  <?php

  // Learning rate field
  $learning_rate = $_REQUEST['learning_rate'];
  echo "<input type='hidden' id ='learning_rate' value='".$learning_rate."'>";

  $hidden_neurons = $_REQUEST['hidden_neurons'];
  echo "<input type='hidden' id ='hidden_neurons' value='".$hidden_neurons."'>";



  // Table containing the training input data
  echo "<table id='training_inputs' style='display: none;'>";

  if ( isset($_FILES["training_inputs_file"]) && $_FILES['training_inputs_file']['tmp_name'] != null) {
    $file = $_FILES['training_inputs_file']['tmp_name'];
  }
  else {
    $file = "example_data/training_inputs.csv";
  }

  $output = "";
  if( ($handle = fopen($file, "r")) !== false) {
    while (($line = fgetcsv($handle)) !== false) {
      $output .= "<tr>";
      foreach ($line as $cell) {
        $output .= "<td>" . htmlspecialchars($cell) . "</td>";
      }
      $output .= "</tr>\n";
    }
    fclose($handle);
  }
  echo $output;

  echo " </table>";

  // Table containing the training output data
  echo "<table id='training_outputs' style='display: none;'>";

  if ( isset($_FILES["training_outputs_file"]) && $_FILES['training_outputs_file']['tmp_name'] != null) {
    $file = $_FILES['training_outputs_file']['tmp_name'];
  }
  else {
    $file = "example_data/training_outputs.csv";
  }

  $output = "";
  if( ($handle = fopen($file, "r")) !== false) {
    while (($line = fgetcsv($handle)) !== false) {
      $output .= "<tr>";
      foreach ($line as $cell) {
        $output .= "<td>" . htmlspecialchars($cell) . "</td>";
      }
      $output .= "</tr>\n";
    }
    fclose($handle);
  }
  echo $output;

  echo " </table>";


  ?>


  <!-- JS -->
  <div class="center">
    <h1> Artificial neural network </h1>
    <canvas id='canvas' width="800" height="600"> Your broswer sucks </canvas>
    <br>
    <input type="button" value="Reset" id="reset_button">
    <br><br>
    <form action="index.php">
      <input type="submit" value="Return">
    </form>

    <script type="text/javascript" src="script.js"></script>
  </div>

  <?php
    include("signature.php");
	?>

</body>
</html>
