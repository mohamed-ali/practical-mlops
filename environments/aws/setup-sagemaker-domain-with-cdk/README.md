# إعداد نطاق SageMaker بسيط باستخدام AWS CDK

يوضح مثال AWS Cloud Development Kit (CDK) هذا كيفية إعداد نطاق SageMaker بسيط باستخدام TypeScript.
سيتم تكوين نطاق SageMaker لاستخدام VPC الافتراضية للحساب وشبكاته الفرعية العامة المرتبطة به.
بالإضافة إلى ذلك، فإنه ينشئ دور تنفيذ SageMaker ويعينه كدور افتراضي لملفات تعريف المستخدم داخل النطاق.

## نظرة عامة

- ينشئ نطاق SageMaker باسم `CustomSageMakerDomain` باستخدام بنية `aws-sagemaker`.
- يستورد VPC الافتراضية للحساب ويسترد شبكاته الفرعية العامة.
- ينشئ دور تنفيذ SageMaker باسم `SageMakerExecutionRole` مع إرفاق سياسة `AmazonSageMakerFullAccess` المُدارة.
- تكوين نطاق SageMaker لاستخدام VPC الافتراضي والشبكات الفرعية العامة ودور التنفيذ الذي تم إنشاؤه كدور مستخدم افتراضي.

## التثبيت

1. انسخ المجلد `setup-minimal-sagemaker-domain` إلى بيئة AWS CloudShell.
2. انتقل إلى المجلد:
```
cd setup-minimal-sagemaker-domain
```
3. قم بتثبيت التبعيات المطلوبة:
```
npm install
```

## النشر

1. قم بتشغيل بيئة CDK (مطلوب مرة واحدة فقط لكل حساب/منطقة):
```
cdk bootstrap
```
2. قم بنشر مجموعة CDK:
```
cdk deploy
```

بعد النشر الناجح، سيتضمن إخراج CloudFormation اسم مورد Amazon (ARN) لنطاق SageMaker الذي تم إنشاؤه.

## التنظيف

لحذف الموارد التي تم إنشاؤها، قم بتشغيل الأمر التالي:

```
cdk destroy
```

## ملاحظات إضافية

- تمنح سياسة `AmazonSageMakerFullAccess` المُدارة أذونات واسعة النطاق لـ SageMaker. يوصى باتباع مبدأ الحد الأدنى من الامتيازات وإنشاء سياسة مخصصة بأذونات الحد الأدنى المطلوبة.
- سيستخدم نطاق SageMaker الإعدادات الافتراضية لملفات تعريف المستخدم وتطبيقات JupyterServer وKernelGateway. يمكنك تخصيص هذه الإعدادات عن طريق تعديل خاصية `defaultUserSettings` في كود CDK.