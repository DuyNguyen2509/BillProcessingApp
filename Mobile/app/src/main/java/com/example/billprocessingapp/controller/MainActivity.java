package com.example.billprocessingapp.controller;

import static android.Manifest.permission.CAMERA;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.example.billprocessingapp.R;

import java.util.ArrayList;
import java.util.List;

import droidninja.filepicker.FilePickerBuilder;
import droidninja.filepicker.FilePickerConst;
import pub.devrel.easypermissions.AppSettingsDialog;
import pub.devrel.easypermissions.EasyPermissions;


public class MainActivity extends AppCompatActivity implements EasyPermissions.PermissionCallbacks {
    private Bitmap imageBitmap;
    private LinearLayout btnCamera, btnGallery, btnFiles;
    private ArrayList<Uri> lstUri = new ArrayList<>();
    private ArrayList<Uri> lstFile = new ArrayList<>();
    static final int REQUEST_IMAGE_CAPTURE = 100;
    static final int REQUEST_PICKER_IMAGE = 101;
    static final int REQUEST_PICKER_FILE = 102;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        //Camera
        btnCamera = findViewById(R.id.btn_camera);
        btnCamera.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (EasyPermissions.hasPermissions(MainActivity.this, Manifest.permission.CAMERA)) {
                    captureImage();
                } else {
                    EasyPermissions.requestPermissions(MainActivity.this, "App needs access to your camera", REQUEST_IMAGE_CAPTURE, Manifest.permission.CAMERA);
                }
            }
        });

        //Gallery
        btnGallery = findViewById(R.id.btn_gallery);
        btnGallery.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String[] strings = {Manifest.permission.CAMERA, Manifest.permission.READ_EXTERNAL_STORAGE};
                if (EasyPermissions.hasPermissions(MainActivity.this, strings)) {
                    imagePicker();
                } else {
                    EasyPermissions.requestPermissions(MainActivity.this, "App needs access to your camera & storage", REQUEST_PICKER_IMAGE, strings);
                }
            }
        });

        //Files
        btnFiles = findViewById(R.id.btn_file);
        btnFiles.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String[] strings = {Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE};
                if (EasyPermissions.hasPermissions(MainActivity.this, strings)) {
                    filePicker();
                } else {
                    EasyPermissions.requestPermissions(MainActivity.this, "App needs access to your storage", REQUEST_PICKER_FILE, strings);
                }
            }
        });
    }

    //--Camera--
    private void captureImage() {
        Intent takePicture = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        if (takePicture.resolveActivity(getPackageManager()) != null) {
            startActivityForResult(takePicture, REQUEST_IMAGE_CAPTURE);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        //camera
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
            Bundle extras = data.getExtras();
            imageBitmap = (Bitmap) extras.get("data");
        }//gallery
        else if (requestCode == REQUEST_PICKER_IMAGE && requestCode == RESULT_OK && data != null) {
            lstUri = data.getParcelableArrayListExtra(FilePickerConst.KEY_SELECTED_MEDIA);
        }//files
        else if (requestCode == REQUEST_PICKER_FILE && requestCode == RESULT_OK && data != null) {
            lstFile = data.getParcelableArrayListExtra(FilePickerConst.KEY_SELECTED_MEDIA);
        }
    }
    //--Camera--

    //--Gallery--
    private void imagePicker() {
        FilePickerBuilder.getInstance()
                .setActivityTitle("Select Images")
                .setSpan(FilePickerConst.SPAN_TYPE.FOLDER_SPAN, 3)
                .setSpan(FilePickerConst.SPAN_TYPE.DETAIL_SPAN, 4)
                .setMaxCount(4)
                .setSelectedFiles(lstUri)
                .setActivityTheme(R.style.CustomTheme)
                .pickPhoto(this);
    }

    @Override
    public void onPermissionsGranted(int requestCode, @NonNull List<String> perms) {
        if (requestCode == REQUEST_PICKER_IMAGE && perms.size() == 2) {
            imagePicker();
        } else if (requestCode == REQUEST_IMAGE_CAPTURE && perms.size() == 1) {
            captureImage();
        } else if (requestCode == REQUEST_PICKER_FILE && perms.size()==2) {
            filePicker();
        }
    }

    @Override
    public void onPermissionsDenied(int requestCode, @NonNull List<String> perms) {
        if (EasyPermissions.somePermissionPermanentlyDenied(this, perms)) {
            new AppSettingsDialog.Builder(this).build().show();
        } else {
            Toast.makeText(getApplicationContext(), "Permission Denied", Toast.LENGTH_SHORT).show();
        }
    }
    //--Gallery--

    //--Files--
    private void filePicker(){
        FilePickerBuilder.getInstance()
                .setActivityTitle("Select Files")
                .setSpan(FilePickerConst.SPAN_TYPE.FOLDER_SPAN, 3)
                .setSpan(FilePickerConst.SPAN_TYPE.DETAIL_SPAN, 4)
                .setMaxCount(4)
                .setSelectedFiles(lstUri)
                .setActivityTheme(R.style.CustomTheme)
                .pickFile(this);
    }
    //--Files--
}