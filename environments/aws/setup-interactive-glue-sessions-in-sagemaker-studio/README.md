وفقًا [للوثائق الرسمية](https://docs.aws.amazon.com/glue/latest/dg/interactive-sessions-sagemaker-studio.html):

> AWS Glue Interactive Sessions هي بيئة تشغيل Apache Spark بدون خادم عند الطلب يمكن لعلماء البيانات والمهندسين استخدامها لبناء تطبيقات تحليلات وإعداد البيانات واختبارها وتشغيلها بسرعة. يمكنك بدء جلسة تفاعلية في AWS Glue من خلال بدء تشغيل دفتر ملاحظات Amazon SageMaker Studio Classic.

باختصار، هذه الجلسات التفاعلية مناسبة تمامًا لكتابة وتصحيح أخطاء كود PySpark بشكل أسرع.

لاستخدام هذه الجلسات في دفاتر ملاحظات JupyterLab داخل SageMaker Studio، يجب توسيع دور تنفيذ SageMaker بأذونات IAM إضافية. تم توضيح أذونات IAM الإضافية في [الوثائق](https://docs.aws.amazon.com/sagemaker/latest/dg/getting-started-glue-sm.html).

اتبع الخطوات التالية لإضافة الأذونات المطلوبة:

1. **تحديد دور تنفيذ SageMaker**

حدد دور تنفيذ SageMaker لنطاق SageMaker حيث تريد استخدام جلسات Glue التفاعلية. بعد ذلك، افتح AWS CloudShell وقم بتصديره كمتغير بيئة:

```bash
export SAGEMAKER_ROLE_NAME=AmazonSageMaker-ExecutionRole-XXXXXXXXXXXXX
```

2. **إرفاق السياسة المُدارة**

بعد ذلك، قم بتشغيل الأمر التالي في AWS CloudShell لتوسيع دور تنفيذ SageMaker بالسياسة المُدارة `AwsGlueSessionUserRestrictedServiceRole`:

```bash
aws iam Attach-role-policy \
--role-name $SAGEMAKER_ROLE_NAME \
--policy-arn arn:aws:iam::aws:policy/service-role/AwsGlueSessionUserRestrictedServiceRole
```

3. **إضافة سياسة مضمنة**

```bash
aws iam put-role-policy \
--role-name $SAGEMAKER_ROLE_NAME \
--policy-name glue-sagemaker-interactive-sessions-setup \
--policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["iam:GetRole","iam:PassRole","sts:GetCallerIdentity"],"Resource":"*"}]}'
```

4. **تحديث سياسة الثقة**

```bash
aws iam update-assume-role-policy \
--role-name $SAGEMAKER_ROLE_NAME \
--policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":["glue.amazonaws.com","sagemaker.amazonaws.com"]},"Action":"sts:AssumeRole"}]}'
```

5. **استخدم نواة Glue PySpark**

الآن، يمكنك نسخ دفتر الملاحظات `notebook-with-glue-interactive-sessions-in-sagemaker.ipynb`، وفتحه باستخدام نواة `Glue PySpark`، والبدء في استخدام الجلسة لتطوير كود PySpark الخاص بك.