<html>
<head>
  <meta charset="UTF-8">
  <title> Neural network </title>
  <link rel="stylesheet" href="styles.css">
  <link rel="icon" href="images/logo_transparent.png">
</head>
<body>
  <div class='center'>
    <h1> Artificial neural network </h1>
    <form action="nn.php" method="post" enctype="multipart/form-data">

      <!-- training data -->
      <fieldset>
        <legend> Training data </legend>
        Training inputs (one column per input):
        <input type="file" name="training_inputs_file" id="fileToUpload">
        <br><br>
        Training outputs (one column per output):
        <input type="file" name="training_outputs_file" id="fileToUpload">
        <br><br>
        Example data is used when no file is uploaded <br>
      </fieldset>

      <br>

      <!-- network settings -->
      <fieldset>
        <legend> Network settings </legend>
        Hidden neurons (layers comma separated):
        <input type="text" value="5, 4" name="hidden_neurons">
        <br><br>
        Learning rate:
        <input type="text" value="0.5" name="learning_rate">
      </fieldset>

      <input type="submit" value="Submit" name="submit">

    </form>
  </div>
  <?php
    include("signature.php");
	?>
</body>
</html>
